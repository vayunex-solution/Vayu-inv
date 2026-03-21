// src/modules/masters/pages/StateMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, MapPin, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../lib';

const StateMasterPage = () => {
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ country_id: '', state_name: '', state_code: '', gst_state_code: '', is_status: true });
  const [addSaving, setAddSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // Load countries for dropdown filter
  useEffect(() => {
    apiClient.get('/api/v1/inventory/countries/dropdown').then(res => {
      setCountries(res.data?.data || []);
    }).catch(() => {});
  }, []);

  const fetchStates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCountryId) params.append('country_id', selectedCountryId);
      const res = await apiClient.get(`/api/v1/inventory/states?${params.toString()}`);
      const data = res.data?.data || [];
      const filtered = search
        ? data.filter(s =>
            (s.StateName || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.GST_State_Code || '').toLowerCase().includes(search.toLowerCase())
          )
        : data;
      setStates(filtered);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to load states', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCountryId]);

  useEffect(() => { fetchStates(); }, [fetchStates]);

  // ── Double-click to edit ──
  const handleDoubleClick = (state) => {
    setEditingId(state.StateId);
    setEditForm({
      country_id: state.CountryId,
      state_name: state.StateName,
      state_code: state.StateCode || '',
      gst_state_code: state.GST_State_Code || '',
      is_status: !!state.IsStatus,
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      setStates(prev => prev.map(s =>
        s.StateId === id
          ? { ...s, StateName: editForm.state_name, GST_State_Code: editForm.gst_state_code, IsStatus: editForm.is_status ? 1 : 0 }
          : s
      ));
      await apiClient.put(`/api/v1/inventory/states/${id}`, editForm);
      showAlert('State updated successfully');
    } catch (err) {
      fetchStates();
      showAlert(err.response?.data?.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this state?')) return;
    const prev = [...states];
    setStates(states.filter(s => s.StateId !== id));
    try {
      await apiClient.delete(`/api/v1/inventory/states/${id}`);
      showAlert('State deleted');
    } catch (err) {
      setStates(prev);
      showAlert(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const handleAdd = async () => {
    if (!addForm.country_id || !addForm.state_name.trim()) {
      showAlert('Country and State Name are required', 'danger'); return;
    }
    setAddSaving(true);
    try {
      await apiClient.post('/api/v1/inventory/states', addForm);
      setShowAddModal(false);
      setAddForm({ country_id: '', state_name: '', state_code: '', gst_state_code: '', is_status: true });
      fetchStates();
      showAlert('State added successfully');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to add state', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

  const getCountryName = (id) => countries.find(c => c.CountryId === id)?.CountryName || `Country #${id}`;

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
          <h4 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            State Master
          </h4>
          <p className="text-muted small mb-0">{states.length} states configured</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" className="rounded-pill" onClick={fetchStates} title="Refresh">
            <RefreshCw size={16} />
          </Button>
          <Button variant="info" className="d-flex align-items-center gap-2 rounded-pill shadow-sm text-white" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add State
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
        <Card.Body className="py-3">
          <Row className="g-2">
            <Col xs={12} md={5}>
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0"><Search size={16} className="text-muted" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search by state name or GST code..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent border-start-0 shadow-none"
                />
                {search && <Button variant="light" onClick={() => setSearch('')}><X size={14} /></Button>}
              </InputGroup>
            </Col>
            <Col xs={12} md={4}>
              <Form.Select value={selectedCountryId} onChange={e => setSelectedCountryId(e.target.value)} className="shadow-none">
                <option value="">All Countries</option>
                {countries.map(c => (
                  <option key={c.CountryId} value={c.CountryId}>{c.CountryName}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} md={3}>
              <Button variant="outline-secondary" className="w-100 rounded-pill" onClick={() => { setSearch(''); setSelectedCountryId(''); }}>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <Spinner animation="border" variant="info" />
          </div>
        ) : states.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <MapPin size={48} className="mb-3 opacity-25" />
            <p>No states found</p>
          </div>
        ) : (
          <div className="table-responsive">
            {/* Desktop */}
            <Table hover className="align-middle mb-0 d-none d-md-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">State Name</th>
                  <th className="border-0">GST Code</th>
                  <th className="border-0">Country</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {states.map((s, idx) => {
                  const editing = editingId === s.StateId;
                  return (
                    <tr key={s.StateId} onDoubleClick={() => !editing && handleDoubleClick(s)}
                        style={{ cursor: editing ? 'default' : 'pointer' }}
                        className={editing ? 'table-info bg-opacity-25' : ''}
                        title={!editing ? 'Double-click to edit' : ''}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                            <MapPin size={16} className="text-info" />
                          </div>
                          {editing
                            ? <Form.Control size="sm" value={editForm.state_name} onChange={e => setEditForm(f => ({ ...f, state_name: e.target.value }))} autoFocus />
                            : <span className="fw-semibold">{s.StateName}</span>}
                        </div>
                      </td>
                      <td>
                        {editing
                          ? <Form.Control size="sm" style={{ width: 100 }} placeholder="GST Code" value={editForm.gst_state_code} onChange={e => setEditForm(f => ({ ...f, gst_state_code: e.target.value }))} />
                          : <code className="bg-info bg-opacity-10 text-info px-2 py-1 rounded small fw-bold">{s.GST_State_Code || '—'}</code>}
                      </td>
                      <td>
                        <span className="badge bg-secondary bg-opacity-10 text-secondary fw-normal rounded-pill px-3">
                          {getCountryName(s.CountryId)}
                        </span>
                      </td>
                      <td className="text-center">
                        {editing
                          ? <Form.Check type="switch" checked={editForm.is_status} onChange={e => setEditForm(f => ({ ...f, is_status: e.target.checked }))} label={editForm.is_status ? 'Active' : 'Inactive'} />
                          : <Badge bg={s.IsStatus ? 'success' : 'secondary'} className="fw-normal rounded-pill px-3">{s.IsStatus ? 'Active' : 'Inactive'}</Badge>}
                      </td>
                      <td className="text-end">
                        {editing ? (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="info" onClick={() => saveEdit(s.StateId)} disabled={savingId === s.StateId} className="rounded-circle p-1 text-white" style={{ width: 28, height: 28 }}>
                              {savingId === s.StateId ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
                            </Button>
                            <Button size="sm" variant="danger" onClick={cancelEdit} className="rounded-circle p-1" style={{ width: 28, height: 28 }}>
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDoubleClick(s)}>
                              <Edit size={14} className="text-muted" />
                            </Button>
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDelete(s.StateId)}>
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
              {states.map((s) => {
                const editing = editingId === s.StateId;
                return (
                  <div key={s.StateId} className={`p-3 border-bottom ${editing ? 'bg-info bg-opacity-10' : ''}`} onDoubleClick={() => !editing && handleDoubleClick(s)}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <MapPin size={18} className="text-info" />
                        <span className="fw-semibold">{s.StateName}</span>
                      </div>
                      <Badge bg={s.IsStatus ? 'success' : 'secondary'}>{s.IsStatus ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="small text-muted mb-1">GST Code: <code className="text-info">{s.GST_State_Code || '—'}</code></div>
                    <div className="small text-muted mb-2">Country: {getCountryName(s.CountryId)}</div>
                    {editing ? (
                      <div className="mb-2">
                        <Row className="g-2">
                          <Col xs={12}><Form.Control size="sm" placeholder="State Name" value={editForm.state_name} onChange={e => setEditForm(f => ({ ...f, state_name: e.target.value }))} /></Col>
                          <Col xs={6}><Form.Control size="sm" placeholder="GST Code" value={editForm.gst_state_code} onChange={e => setEditForm(f => ({ ...f, gst_state_code: e.target.value }))} /></Col>
                          <Col xs={6}>
                            <Form.Select size="sm" value={editForm.is_status ? '1' : '0'} onChange={e => setEditForm(f => ({ ...f, is_status: e.target.value === '1' }))}>
                              <option value="1">Active</option>
                              <option value="0">Inactive</option>
                            </Form.Select>
                          </Col>
                        </Row>
                        <div className="d-flex gap-2 mt-2">
                          <Button size="sm" variant="danger" className="flex-fill rounded-pill" onClick={cancelEdit}>Cancel</Button>
                          <Button size="sm" variant="info" className="flex-fill rounded-pill text-white" onClick={() => saveEdit(s.StateId)} disabled={savingId === s.StateId}>Save</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="light" className="flex-fill" onClick={() => handleDoubleClick(s)}><Edit size={14} className="me-1" />Edit</Button>
                        <Button size="sm" variant="light" className="flex-fill text-danger" onClick={() => handleDelete(s.StateId)}><Trash2 size={14} className="me-1" />Delete</Button>
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

      {/* Add State Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add New State</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Country <span className="text-danger">*</span></Form.Label>
              <Form.Select value={addForm.country_id} onChange={e => setAddForm(f => ({ ...f, country_id: e.target.value }))}>
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.CountryId} value={c.CountryId}>{c.CountryName}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">State Name <span className="text-danger">*</span></Form.Label>
              <Form.Control placeholder="e.g. Maharashtra" value={addForm.state_name} onChange={e => setAddForm(f => ({ ...f, state_name: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">GST State Code</Form.Label>
              <Form.Control placeholder="e.g. 27" maxLength={5} value={addForm.gst_state_code} onChange={e => setAddForm(f => ({ ...f, gst_state_code: e.target.value }))} />
              <Form.Text className="text-muted">2-digit GST state code (e.g. 27 for Maharashtra)</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="switch" label="Active" checked={addForm.is_status} onChange={e => setAddForm(f => ({ ...f, is_status: e.target.checked }))} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="info" className="rounded-pill px-4 text-white" onClick={handleAdd} disabled={addSaving}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : 'Add State'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StateMasterPage;
