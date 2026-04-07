// src/modules/masters/pages/HsnMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, Hash, RefreshCw, Percent } from 'lucide-react';
import { apiClient } from '../../../lib';

const BASE = '/api/v1/inventory/hsn';

const TAX_SLABS = [0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28];

const HsnMasterPage = () => {
  const [hsnList, setHsnList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ hsn_code: '', description: '', tax_rate: 18, is_active: 1 });
  const [addSaving, setAddSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const norm = (res) => {
    const raw = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    return raw.map(h => {
      // Use hsn_code as ID if id is missing/undefined/0
      const id = h.id ?? h.Id ?? h.HsnId ?? h.ID ?? h.hsn_code ?? h.HSNCode;
      return {
        id: id,
        hsn_code: h.hsn_code ?? h.HSNCode ?? h.HsnCode ?? '',
        description: h.description ?? h.Description ?? h.HSNDescription ?? '',
        tax_rate: parseFloat(h.tax_rate ?? h.TaxRate ?? h.GST_Rate ?? 0),
        is_active: h.is_active ?? h.IsActive ?? 1
      };
    });
  };


  const fetchHsn = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(BASE, { params: { search } });
      const data = norm(res);
      setHsnList(data);
    } catch (err) {
      showAlert(err?.message || 'Failed to load HSN codes', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchHsn(); }, [fetchHsn]);

  // ─── Inline Edit ───────────────────────────────────────
  const handleDoubleClick = (hsn) => {
    setEditingId(hsn.id);
    setEditForm({
      hsn_code: hsn.hsn_code,
      description: hsn.description || '',
      tax_rate: hsn.tax_rate,
      is_active: hsn.is_active === 'Y' || hsn.is_active === 1 || hsn.is_active === true ? 1 : 0
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    if (!editForm.hsn_code?.trim()) return showAlert('HSN code is required', 'danger');
    setSavingId(id);
    try {
      setHsnList(prev => prev.map(h => h.id === id ? { ...h, ...editForm } : h));
      await apiClient.put(`${BASE}/${id}`, editForm);
      showAlert('HSN updated successfully');
    } catch (err) {
      fetchHsn();
      showAlert(err?.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      cancelEdit();
    }
  };

  // ─── Delete ────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this HSN code?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`${BASE}/${id}`);
      setHsnList(prev => prev.filter(h => h.id !== id));
      showAlert('HSN code deleted');
    } catch (err) {
      showAlert(err?.message || 'Delete failed', 'danger');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Add Modal ─────────────────────────────────────────
  const openAddModal = () => {
    setAddForm({ hsn_code: '', description: '', tax_rate: 18, is_active: 1 });
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!addForm.hsn_code?.trim()) return showAlert('HSN code is required', 'danger');
    setAddSaving(true);
    try {
      const res = await apiClient.post(BASE, addForm);
      const created = res.data || res;
      setHsnList(prev => [created, ...prev]);
      setShowAddModal(false);
      showAlert('HSN code added successfully');
    } catch (err) {
      showAlert(err?.message || 'Failed to add HSN', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

  const getTaxBadgeColor = (rate) => {
    if (rate === 0) return { bg: '#f3f4f6', text: '#374151' }; // Grey
    if (rate <= 5) return { bg: '#dcfce7', text: '#166534' }; // Green
    if (rate <= 12) return { bg: '#dbeafe', text: '#1e40af' }; // Blue
    if (rate <= 18) return { bg: '#fef3c7', text: '#92400e' }; // Amber
    return { bg: '#fee2e2', text: '#991b1b' }; // Red
  };


  return (
    <div className="container-fluid p-0">
      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible mb-3 shadow-sm`} role="alert">
          {alert.msg}
          <button type="button" className="btn-close" onClick={() => setAlert(null)} />
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 gradient-text d-flex align-items-center gap-2">
            <Hash size={22} /> HSN Master
          </h4>
          <p className="text-muted small mb-0">{hsnList.length} HSN codes • GST classification • Double-tap to quick edit</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" className="rounded-pill" onClick={fetchHsn} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </Button>
          <Button variant="primary" className="btn-glossy d-flex align-items-center gap-2 rounded-pill shadow-sm" onClick={openAddModal}>
            <Plus size={18} /> Add HSN
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="glass-card border-0 mb-4">
        <Card.Body className="py-2">
          <InputGroup>
            <InputGroup.Text className="bg-transparent border-end-0"><Search size={15} className="text-muted" /></InputGroup.Text>
            <Form.Control
              placeholder="Search by HSN code or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-start-0 shadow-none"
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="glass-card border-0 overflow-hidden">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center p-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : hsnList.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <Hash size={48} className="mb-3 opacity-25" />
            <p>No HSN codes found. Add one to get started.</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <Table hover className="align-middle mb-0 d-none d-md-table">
              <thead className="bg-light bg-opacity-50">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">HSN Code</th>
                  <th className="border-0">Description</th>
                  <th className="border-0 text-center">Tax Rate</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hsnList.map((hsn, idx) => {
                  const isEditing = editingId === hsn.id;
                  const taxColors = getTaxBadgeColor(hsn.tax_rate);
                  return (
                    <tr
                      key={hsn.id}
                      onDoubleClick={() => !isEditing && handleDoubleClick(hsn)}
                      style={{ cursor: isEditing ? 'default' : 'pointer' }}
                      className={isEditing ? 'table-active' : ''}
                    >
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        {isEditing ? (
                          <Form.Control size="sm" style={{ maxWidth: 120 }} value={editForm.hsn_code} onChange={e => setEditForm(p => ({ ...p, hsn_code: e.target.value }))} autoFocus />
                        ) : (
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-warning bg-opacity-10 text-warning rounded p-1">
                              <Hash size={16} />
                            </div>
                            <code className="text-dark fw-bold">{hsn.hsn_code}</code>
                          </div>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <Form.Control size="sm" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" />
                        ) : (
                          <span className="text-muted small">{hsn.description || '—'}</span>
                        )}
                      </td>
                      <td className="text-center" style={{ width: 130 }}>
                        {isEditing ? (
                          <Form.Select size="sm" value={editForm.tax_rate} onChange={e => setEditForm(p => ({ ...p, tax_rate: parseFloat(e.target.value) }))}>
                            {TAX_SLABS.map(t => <option key={t} value={t}>{t}%</option>)}
                          </Form.Select>
                        ) : (
                          <Badge className="border-0 rounded-pill px-3 py-2 fw-bold" style={{ backgroundColor: taxColors.bg, color: taxColors.text, fontSize: '0.75rem' }}>
                            <Percent size={10} className="me-1" />{hsn.tax_rate ?? 0}%
                          </Badge>
                        )}
                      </td>
                      <td className="text-center" style={{ width: 110 }}>
                        {isEditing ? (
                          <Form.Select size="sm" value={editForm.is_active} onChange={e => setEditForm(p => ({ ...p, is_active: parseInt(e.target.value) }))}>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                          </Form.Select>
                        ) : (
                          <Badge className="border-0 rounded-pill px-3 py-2 fw-bold" style={{ 
                            backgroundColor: hsn.is_active ? '#dcfce7' : '#f3f4f6', 
                            color: hsn.is_active ? '#166534' : '#374151',
                            fontSize: '0.75rem' 
                          }}>
                            {hsn.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        )}
                      </td>

                      <td className="text-end">
                        {isEditing ? (
                          <div className="d-flex justify-content-end gap-2">
                            <Button variant="success" size="sm" className="rounded-circle btn-icon" onClick={() => saveEdit(hsn.id)} disabled={savingId === hsn.id}>
                              {savingId === hsn.id ? <Spinner size="sm" animation="border" /> : <Check size={15} />}
                            </Button>
                            <Button variant="secondary" size="sm" className="rounded-circle btn-icon" onClick={cancelEdit} disabled={savingId === hsn.id}>
                              <X size={15} />
                            </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-1">
                            <Button variant="light" size="sm" className="rounded-circle btn-icon text-primary" title="Edit" onClick={() => handleDoubleClick(hsn)}>
                              <Edit size={15} />
                            </Button>
                            <Button variant="light" size="sm" className="rounded-circle btn-icon text-danger" title="Delete" onClick={() => handleDelete(hsn.id)} disabled={deletingId === hsn.id}>
                              {deletingId === hsn.id ? <Spinner size="sm" animation="border" /> : <Trash2 size={15} />}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            {/* Mobile Cards */}
            <div className="d-block d-md-none">
              {hsnList.map(hsn => {
                const taxColors = getTaxBadgeColor(hsn.tax_rate);
                return (
                  <div key={hsn.id} className="p-3 border-bottom d-flex align-items-center gap-3">
                    <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: 42, height: 42, minWidth: 42 }}>
                      <Hash size={18} />
                    </div>
                    <div className="flex-fill">
                      <div className="fw-bold font-monospace">{hsn.hsn_code}</div>
                      <div className="small text-muted">{hsn.description || '—'}</div>
                    </div>
                    <Badge bg={taxColors.bg} className="bg-opacity-15 rounded-pill" style={{ color: taxColors.text }}>
                      {hsn.tax_rate ?? 0}%
                    </Badge>
                    <div className="d-flex gap-1">
                      <Button variant="light" size="sm" className="rounded-circle btn-icon text-primary" onClick={() => handleDoubleClick(hsn)}><Edit size={14} /></Button>
                      <Button variant="light" size="sm" className="rounded-circle btn-icon text-danger" onClick={() => handleDelete(hsn.id)}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Add HSN Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
            <Hash size={20} className="text-warning" /> Add New HSN Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Row className="g-3">
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">HSN Code <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  placeholder="e.g. 8471"
                  value={addForm.hsn_code}
                  onChange={e => setAddForm(p => ({ ...p, hsn_code: e.target.value }))}
                  autoFocus
                />
                <Form.Text className="text-muted">4–8 digit code as per GST</Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Tax Rate (GST%)</Form.Label>
                <Form.Select value={addForm.tax_rate} onChange={e => setAddForm(p => ({ ...p, tax_rate: parseFloat(e.target.value) }))}>
                  {TAX_SLABS.map(t => <option key={t} value={t}>{t}%</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="e.g. Computers, printers and other office machines..."
                  value={addForm.description}
                  onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Status</Form.Label>
                <Form.Select value={addForm.is_active} onChange={e => setAddForm(p => ({ ...p, is_active: parseInt(e.target.value) }))}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAddModal(false)} disabled={addSaving}>Cancel</Button>
          <Button variant="primary" className="btn-glossy rounded-pill px-4" onClick={handleAdd} disabled={addSaving}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : <><Check size={16} className="me-1" />Save HSN</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HsnMasterPage;
