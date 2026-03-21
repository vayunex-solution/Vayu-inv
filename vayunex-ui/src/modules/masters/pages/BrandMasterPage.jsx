// src/modules/masters/pages/BrandMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, Tag, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../lib';

const BrandMasterPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ brand_name: '', short_name: '', is_active: 'Y' });
  const [addSaving, setAddSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/inventory/brands');
      const data = res.data || res || [];
      const filtered = search
        ? data.filter(b =>
            (b.BrandName || '').toLowerCase().includes(search.toLowerCase()) ||
            (b.ShortName || '').toLowerCase().includes(search.toLowerCase())
          )
        : data;
      setBrands(filtered);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to load brands', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const handleDoubleClick = (brand) => {
    setEditingId(brand.BrandId);
    setEditForm({
      brand_name: brand.BrandName,
      short_name: brand.ShortName || '',
      is_active: brand.IsActive || 'Y',
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      setBrands(prev => prev.map(b =>
        b.BrandId === id ? { ...b, BrandName: editForm.brand_name, ShortName: editForm.short_name, IsActive: editForm.is_active } : b
      ));
      await apiClient.put(`/api/v1/inventory/brands/${id}`, editForm);
      showAlert('Brand updated successfully');
    } catch (err) {
      fetchBrands();
      showAlert(err.response?.data?.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand?')) return;
    const prev = [...brands];
    setBrands(brands.filter(b => b.BrandId !== id));
    try {
      await apiClient.delete(`/api/v1/inventory/brands/${id}`);
      showAlert('Brand deleted');
    } catch (err) {
      setBrands(prev);
      showAlert(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const handleAdd = async () => {
    if (!addForm.brand_name.trim()) {
      showAlert('Brand Name is required', 'danger'); return;
    }
    setAddSaving(true);
    try {
      await apiClient.post('/api/v1/inventory/brands', addForm);
      setShowAddModal(false);
      setAddForm({ brand_name: '', short_name: '', is_active: 'Y' });
      fetchBrands();
      showAlert('Brand added successfully');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to add brand', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible position-fixed top-0 end-0 m-3 shadow`} style={{ zIndex: 9999 }}>
          {alert.msg}
        </div>
      )}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Brand Master
          </h4>
          <p className="text-muted small mb-0">{brands.length} brands configured</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" className="rounded-pill" onClick={fetchBrands} title="Refresh">
            <RefreshCw size={16} />
          </Button>
          <Button variant="primary" className="d-flex align-items-center gap-2 rounded-pill shadow-sm" onClick={() => setShowAddModal(true)}
            style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', border: 'none' }}>
            <Plus size={18} /> Add Brand
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-4" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
        <Card.Body className="py-3">
          <Row className="g-2">
            <Col xs={12} md={8}>
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0"><Search size={16} className="text-muted" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search by brand name or short name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent border-start-0 shadow-none"
                />
                {search && <Button variant="light" onClick={() => setSearch('')}><X size={14} /></Button>}
              </InputGroup>
            </Col>
            <Col xs={12} md={4}>
              <Button variant="outline-secondary" className="w-100 rounded-pill" onClick={() => setSearch('')}>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <Spinner animation="border" style={{ color: '#a855f7' }} />
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <Tag size={48} className="mb-3 opacity-25" />
            <p>No brands found. Click "Add Brand" to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 d-none d-md-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">Brand Name</th>
                  <th className="border-0">Short Name</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b, idx) => {
                  const editing = editingId === b.BrandId;
                  return (
                    <tr key={b.BrandId} onDoubleClick={() => !editing && handleDoubleClick(b)}
                        style={{ cursor: editing ? 'default' : 'pointer' }}
                        className={editing ? 'table-warning bg-opacity-25' : ''}
                        title={!editing ? 'Double-click to edit' : ''}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #a855f720, #7c3aed20)' }}>
                            <Tag size={16} style={{ color: '#a855f7' }} />
                          </div>
                          {editing
                            ? <Form.Control size="sm" value={editForm.brand_name} onChange={e => setEditForm(f => ({ ...f, brand_name: e.target.value }))} autoFocus />
                            : <span className="fw-semibold">{b.BrandName}</span>}
                        </div>
                      </td>
                      <td>
                        {editing
                          ? <Form.Control size="sm" style={{ width: 120 }} placeholder="Short name" value={editForm.short_name} onChange={e => setEditForm(f => ({ ...f, short_name: e.target.value }))} />
                          : <code className="bg-light px-2 py-1 rounded small">{b.ShortName || '—'}</code>}
                      </td>
                      <td className="text-center">
                        {editing
                          ? <Form.Select size="sm" style={{ width: 110 }} value={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.value }))}>
                              <option value="Y">Active</option>
                              <option value="N">Inactive</option>
                            </Form.Select>
                          : <Badge bg={b.IsActive === 'Y' ? 'success' : 'secondary'} className="fw-normal rounded-pill px-3">{b.IsActive === 'Y' ? 'Active' : 'Inactive'}</Badge>}
                      </td>
                      <td className="text-end">
                        {editing ? (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="warning" onClick={() => saveEdit(b.BrandId)} disabled={savingId === b.BrandId} className="rounded-circle p-1 text-white" style={{ width: 28, height: 28 }}>
                              {savingId === b.BrandId ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
                            </Button>
                            <Button size="sm" variant="danger" onClick={cancelEdit} className="rounded-circle p-1" style={{ width: 28, height: 28 }}>
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDoubleClick(b)}>
                              <Edit size={14} className="text-muted" />
                            </Button>
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDelete(b.BrandId)}>
                              <Trash2 size={14} className="text-danger" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            {/* Mobile cards */}
            <div className="d-block d-md-none">
              {brands.map(b => {
                const editing = editingId === b.BrandId;
                return (
                  <div key={b.BrandId} className={`p-3 border-bottom ${editing ? 'bg-warning bg-opacity-10' : ''}`} onDoubleClick={() => !editing && handleDoubleClick(b)}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <Tag size={18} style={{ color: '#a855f7' }} />
                        <span className="fw-semibold">{b.BrandName}</span>
                      </div>
                      <Badge bg={b.IsActive === 'Y' ? 'success' : 'secondary'}>{b.IsActive === 'Y' ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    {b.ShortName && <div className="small text-muted mb-2">Short: <code>{b.ShortName}</code></div>}
                    {editing ? (
                      <div>
                        <Row className="g-2 mb-2">
                          <Col xs={12}><Form.Control size="sm" placeholder="Brand Name" value={editForm.brand_name} onChange={e => setEditForm(f => ({ ...f, brand_name: e.target.value }))} /></Col>
                          <Col xs={6}><Form.Control size="sm" placeholder="Short Name" value={editForm.short_name} onChange={e => setEditForm(f => ({ ...f, short_name: e.target.value }))} /></Col>
                          <Col xs={6}>
                            <Form.Select size="sm" value={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.value }))}>
                              <option value="Y">Active</option>
                              <option value="N">Inactive</option>
                            </Form.Select>
                          </Col>
                        </Row>
                        <div className="d-flex gap-2">
                          <Button size="sm" variant="danger" className="flex-fill rounded-pill" onClick={cancelEdit}>Cancel</Button>
                          <Button size="sm" variant="warning" className="flex-fill rounded-pill text-white" onClick={() => saveEdit(b.BrandId)} disabled={savingId === b.BrandId}>Save</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="light" className="flex-fill" onClick={() => handleDoubleClick(b)}><Edit size={14} className="me-1" />Edit</Button>
                        <Button size="sm" variant="light" className="flex-fill text-danger" onClick={() => handleDelete(b.BrandId)}><Trash2 size={14} className="me-1" />Delete</Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
      <div className="text-center mt-3"><small className="text-muted">✨ Double-click any row to quick edit</small></div>

      {/* Add Brand Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add New Brand</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Brand Name <span className="text-danger">*</span></Form.Label>
              <Form.Control placeholder="e.g. Samsung" value={addForm.brand_name} onChange={e => setAddForm(f => ({ ...f, brand_name: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Short Name</Form.Label>
              <Form.Control placeholder="e.g. SAM" maxLength={10} value={addForm.short_name} onChange={e => setAddForm(f => ({ ...f, short_name: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Status</Form.Label>
              <Form.Select value={addForm.is_active} onChange={e => setAddForm(f => ({ ...f, is_active: e.target.value }))}>
                <option value="Y">Active</option>
                <option value="N">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button className="rounded-pill px-4 text-white" onClick={handleAdd} disabled={addSaving}
            style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', border: 'none' }}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : 'Add Brand'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BrandMasterPage;
