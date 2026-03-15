// src/modules/masters/pages/CountryMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, Globe, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../lib';

const CountryMasterPage = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ country_name: '', country_code: '', is_status: true });
  const [addSaving, setAddSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/inventory/countries');
      const data = res.data?.data || res.data || [];
      // Filter by search locally
      const filtered = search
        ? data.filter(c =>
            (c.CountryName || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.CountryCode || '').toLowerCase().includes(search.toLowerCase())
          )
        : data;
      setCountries(filtered);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to load countries', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // ── Double-tap to edit ──
  const handleDoubleClick = (country) => {
    setEditingId(country.CountryId);
    setEditForm({
      country_name: country.CountryName,
      country_code: country.CountryCode,
      is_status: !!country.IsActive,
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      setCountries(prev => prev.map(c =>
        c.CountryId === id
          ? { ...c, CountryName: editForm.country_name, CountryCode: editForm.country_code, IsActive: editForm.is_status ? 1 : 0 }
          : c
      ));
      await apiClient.put(`/api/v1/inventory/countries/${id}`, editForm);
      showAlert('Country updated successfully');
    } catch (err) {
      fetchCountries();
      showAlert(err.response?.data?.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this country?')) return;
    const prev = [...countries];
    setCountries(countries.filter(c => c.CountryId !== id));
    try {
      await apiClient.delete(`/api/v1/inventory/countries/${id}`);
      showAlert('Country deleted');
    } catch (err) {
      setCountries(prev);
      showAlert(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const handleAdd = async () => {
    if (!addForm.country_name.trim() || !addForm.country_code.trim()) {
      showAlert('Country Name and Code are required', 'danger'); return;
    }
    setAddSaving(true);
    try {
      await apiClient.post('/api/v1/inventory/countries', addForm);
      setShowAddModal(false);
      setAddForm({ country_name: '', country_code: '', is_status: true });
      fetchCountries();
      showAlert('Country added successfully');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to add country', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible position-fixed top-0 end-0 m-3 shadow`} style={{ zIndex: 9999 }}>
          {alert.msg}
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Country Master
          </h4>
          <p className="text-muted small mb-0">{countries.length} countries configured</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" className="rounded-pill" onClick={fetchCountries} title="Refresh">
            <RefreshCw size={16} />
          </Button>
          <Button variant="success" className="d-flex align-items-center gap-2 rounded-pill shadow-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Country
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <Card className="border-0 shadow-sm mb-4" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
        <Card.Body className="py-3">
          <InputGroup>
            <InputGroup.Text className="bg-transparent border-end-0"><Search size={16} className="text-muted" /></InputGroup.Text>
            <Form.Control
              placeholder="Search by country name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-start-0 shadow-none"
            />
            {search && (
              <Button variant="light" onClick={() => setSearch('')}><X size={14} /></Button>
            )}
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Table Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <Spinner animation="border" variant="success" />
          </div>
        ) : countries.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <Globe size={48} className="mb-3 opacity-25" />
            <p>No countries found</p>
          </div>
        ) : (
          <div className="table-responsive">
            {/* Desktop */}
            <Table hover className="align-middle mb-0 d-none d-md-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">Country Name</th>
                  <th className="border-0">Code</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((c, idx) => {
                  const editing = editingId === c.CountryId;
                  return (
                    <tr key={c.CountryId} onDoubleClick={() => !editing && handleDoubleClick(c)}
                        style={{ cursor: editing ? 'default' : 'pointer' }}
                        className={editing ? 'table-success bg-opacity-25' : ''}
                        title={!editing ? 'Double-click to edit' : ''}>
                      <td className="text-muted small">{(c.Serial || idx + 1)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                            <Globe size={16} className="text-success" />
                          </div>
                          {editing
                            ? <Form.Control size="sm" value={editForm.country_name} onChange={e => setEditForm(f => ({ ...f, country_name: e.target.value }))} autoFocus />
                            : <span className="fw-semibold">{c.CountryName}</span>}
                        </div>
                      </td>
                      <td>
                        {editing
                          ? <Form.Control size="sm" style={{ width: 90 }} value={editForm.country_code} onChange={e => setEditForm(f => ({ ...f, country_code: e.target.value }))} />
                          : <code className="bg-success bg-opacity-10 text-success px-2 py-1 rounded small fw-bold">{c.CountryCode}</code>}
                      </td>
                      <td className="text-center">
                        {editing
                          ? <Form.Check type="switch" checked={editForm.is_status} onChange={e => setEditForm(f => ({ ...f, is_status: e.target.checked }))} label={editForm.is_status ? 'Active' : 'Inactive'} />
                          : <Badge bg={c.IsActive ? 'success' : 'secondary'} className="fw-normal rounded-pill px-3">{c.IsActive ? 'Active' : 'Inactive'}</Badge>}
                      </td>
                      <td className="text-end">
                        {editing ? (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="success" onClick={() => saveEdit(c.CountryId)} disabled={savingId === c.CountryId} className="rounded-circle p-1" style={{ width: 28, height: 28 }}>
                              {savingId === c.CountryId ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
                            </Button>
                            <Button size="sm" variant="danger" onClick={cancelEdit} className="rounded-circle p-1" style={{ width: 28, height: 28 }}>
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDoubleClick(c)}>
                              <Edit size={14} className="text-muted" />
                            </Button>
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDelete(c.CountryId)}>
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
              {countries.map((c) => {
                const editing = editingId === c.CountryId;
                return (
                  <div key={c.CountryId} className={`p-3 border-bottom ${editing ? 'bg-success bg-opacity-10' : ''}`} onDoubleClick={() => !editing && handleDoubleClick(c)}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <Globe size={18} className="text-success" />
                        <span className="fw-semibold">{c.CountryName}</span>
                      </div>
                      <Badge bg={c.IsActive ? 'success' : 'secondary'}>{c.IsActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="small text-muted mb-2">Code: <code className="text-success">{c.CountryCode}</code></div>
                    {editing ? (
                      <div className="mb-2">
                        <Row className="g-2">
                          <Col xs={12}><Form.Control size="sm" placeholder="Country Name" value={editForm.country_name} onChange={e => setEditForm(f => ({ ...f, country_name: e.target.value }))} /></Col>
                          <Col xs={6}><Form.Control size="sm" placeholder="Code" value={editForm.country_code} onChange={e => setEditForm(f => ({ ...f, country_code: e.target.value }))} /></Col>
                          <Col xs={6}>
                            <Form.Select size="sm" value={editForm.is_status ? '1' : '0'} onChange={e => setEditForm(f => ({ ...f, is_status: e.target.value === '1' }))}>
                              <option value="1">Active</option>
                              <option value="0">Inactive</option>
                            </Form.Select>
                          </Col>
                        </Row>
                        <div className="d-flex gap-2 mt-2">
                          <Button size="sm" variant="danger" className="flex-fill rounded-pill" onClick={cancelEdit}>Cancel</Button>
                          <Button size="sm" variant="success" className="flex-fill rounded-pill" onClick={() => saveEdit(c.CountryId)} disabled={savingId === c.CountryId}>Save</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="light" className="flex-fill" onClick={() => handleDoubleClick(c)}><Edit size={14} className="me-1" />Edit</Button>
                        <Button size="sm" variant="light" className="flex-fill text-danger" onClick={() => handleDelete(c.CountryId)}><Trash2 size={14} className="me-1" />Delete</Button>
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

      {/* Add Country Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add New Country</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Country Name <span className="text-danger">*</span></Form.Label>
              <Form.Control placeholder="e.g. India" value={addForm.country_name} onChange={e => setAddForm(f => ({ ...f, country_name: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Country Code <span className="text-danger">*</span></Form.Label>
              <Form.Control placeholder="e.g. IN" maxLength={3} value={addForm.country_code} onChange={e => setAddForm(f => ({ ...f, country_code: e.target.value.toUpperCase() }))} />
              <Form.Text className="text-muted">2-3 letter ISO code (e.g. IN, US, GB)</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="switch" label="Active" checked={addForm.is_status} onChange={e => setAddForm(f => ({ ...f, is_status: e.target.checked }))} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="success" className="rounded-pill px-4" onClick={handleAdd} disabled={addSaving}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : 'Add Country'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CountryMasterPage;
