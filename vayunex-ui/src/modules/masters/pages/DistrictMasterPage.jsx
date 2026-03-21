// src/modules/masters/pages/DistrictMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, Map, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../lib';

const DistrictMasterPage = () => {
  const [districts, setDistricts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ district_name: '', country_id: '', state_id: '', is_active: 'Y' });
  const [addStates, setAddStates] = useState([]);
  const [addSaving, setAddSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // Load countries
  useEffect(() => {
    apiClient.get('/api/v1/inventory/countries/dropdown').then(res => {
      setCountries(res.data || res || []);
    }).catch(() => {});
  }, []);

  // Load states when country changes (filter dropdown)
  useEffect(() => {
    if (selectedCountryId) {
      apiClient.get(`/api/v1/inventory/states/dropdown?country_id=${selectedCountryId}`)
        .then(res => { setStates(res.data || res || []); })
        .catch(() => {});
      setSelectedStateId('');
    } else {
      setStates([]);
      setSelectedStateId('');
    }
  }, [selectedCountryId]);

  const fetchDistricts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStateId) params.append('state_id', selectedStateId);
      const res = await apiClient.get(`/api/v1/inventory/districts?${params.toString()}`);
      const data = res.data || res || [];
      const filtered = search
        ? data.filter(d => (d.DistrictName || '').toLowerCase().includes(search.toLowerCase()))
        : data;
      setDistricts(filtered);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to load districts', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search, selectedStateId]);

  useEffect(() => { fetchDistricts(); }, [fetchDistricts]);

  // Add Modal: states for the modal depend on country selected in modal
  const handleAddCountryChange = async (cid) => {
    setAddForm(f => ({ ...f, country_id: cid, state_id: '' }));
    if (cid) {
      try {
        const res = await apiClient.get(`/api/v1/inventory/states/dropdown?country_id=${cid}`);
        setAddStates(res.data || res || []);
      } catch { setAddStates([]); }
    } else {
      setAddStates([]);
    }
  };

  const handleDoubleClick = (d) => {
    setEditingId(d.DistrictId);
    setEditForm({
      district_name: d.DistrictName,
      state_id: d.StateId,
      country_id: d.CountryId,
      is_active: d.IsActive || 'Y',
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      setDistricts(prev => prev.map(d =>
        d.DistrictId === id ? { ...d, DistrictName: editForm.district_name, IsActive: editForm.is_active } : d
      ));
      await apiClient.put(`/api/v1/inventory/districts/${id}`, editForm);
      showAlert('District updated successfully');
    } catch (err) {
      fetchDistricts();
      showAlert(err.response?.data?.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this district?')) return;
    const prev = [...districts];
    setDistricts(districts.filter(d => d.DistrictId !== id));
    try {
      await apiClient.delete(`/api/v1/inventory/districts/${id}`);
      showAlert('District deleted');
    } catch (err) {
      setDistricts(prev);
      showAlert(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const handleAdd = async () => {
    if (!addForm.country_id || !addForm.state_id || !addForm.district_name.trim()) {
      showAlert('Country, State and District Name are required', 'danger'); return;
    }
    setAddSaving(true);
    try {
      await apiClient.post('/api/v1/inventory/districts', addForm);
      setShowAddModal(false);
      setAddForm({ district_name: '', country_id: '', state_id: '', is_active: 'Y' });
      setAddStates([]);
      fetchDistricts();
      showAlert('District added successfully');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to add district', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

  const getCountryName = (id) => countries.find(c => c.CountryId === id)?.CountryName || `Country #${id}`;
  const getStateName = (id) => states.find(s => s.StateId === id)?.StateName || (id ? `State #${id}` : '—');

  return (
    <div className="container-fluid p-0">
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible position-fixed top-0 end-0 m-3 shadow`} style={{ zIndex: 9999 }}>
          {alert.msg}
        </div>
      )}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            District Master
          </h4>
          <p className="text-muted small mb-0">{districts.length} districts configured</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" className="rounded-pill" onClick={fetchDistricts} title="Refresh">
            <RefreshCw size={16} />
          </Button>
          <Button className="d-flex align-items-center gap-2 rounded-pill shadow-sm text-white" onClick={() => setShowAddModal(true)}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>
            <Plus size={18} /> Add District
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-4" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
        <Card.Body className="py-3">
          <Row className="g-2">
            <Col xs={12} md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0"><Search size={16} className="text-muted" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search district..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent border-start-0 shadow-none"
                />
                {search && <Button variant="light" onClick={() => setSearch('')}><X size={14} /></Button>}
              </InputGroup>
            </Col>
            <Col xs={12} md={3}>
              <Form.Select value={selectedCountryId} onChange={e => setSelectedCountryId(e.target.value)} className="shadow-none">
                <option value="">All Countries</option>
                {countries.map(c => <option key={c.CountryId} value={c.CountryId}>{c.CountryName}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} md={3}>
              <Form.Select value={selectedStateId} onChange={e => setSelectedStateId(e.target.value)} className="shadow-none" disabled={!selectedCountryId}>
                <option value="">All States</option>
                {states.map(s => <option key={s.StateId} value={s.StateId}>{s.StateName}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} md={2}>
              <Button variant="outline-secondary" className="w-100 rounded-pill" onClick={() => { setSearch(''); setSelectedCountryId(''); setSelectedStateId(''); }}>
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <Spinner animation="border" style={{ color: '#10b981' }} />
          </div>
        ) : districts.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <Map size={48} className="mb-3 opacity-25" />
            <p>No districts found. Adjust filters or add a new district.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 d-none d-md-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">District Name</th>
                  <th className="border-0">State</th>
                  <th className="border-0">Country</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {districts.map((d, idx) => {
                  const editing = editingId === d.DistrictId;
                  return (
                    <tr key={d.DistrictId} onDoubleClick={() => !editing && handleDoubleClick(d)}
                        style={{ cursor: editing ? 'default' : 'pointer' }}
                        className={editing ? 'table-success bg-opacity-25' : ''}
                        title={!editing ? 'Double-click to edit' : ''}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #10b98120, #05996920)' }}>
                            <Map size={16} style={{ color: '#10b981' }} />
                          </div>
                          {editing
                            ? <Form.Control size="sm" value={editForm.district_name} onChange={e => setEditForm(f => ({ ...f, district_name: e.target.value }))} autoFocus />
                            : <span className="fw-semibold">{d.DistrictName}</span>}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary bg-opacity-10 text-secondary fw-normal rounded-pill px-3">
                          {d.State?.StateName || getStateName(d.StateId)}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary bg-opacity-10 text-secondary fw-normal rounded-pill px-3">
                          {d.Country?.CountryName || getCountryName(d.CountryId)}
                        </span>
                      </td>
                      <td className="text-center">
                        {editing
                          ? <Form.Select size="sm" style={{ width: 110 }} value={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.value }))}>
                              <option value="Y">Active</option>
                              <option value="N">Inactive</option>
                            </Form.Select>
                          : <Badge bg={d.IsActive === 'Y' ? 'success' : 'secondary'} className="fw-normal rounded-pill px-3">{d.IsActive === 'Y' ? 'Active' : 'Inactive'}</Badge>}
                      </td>
                      <td className="text-end">
                        {editing ? (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="success" onClick={() => saveEdit(d.DistrictId)} disabled={savingId === d.DistrictId} className="rounded-circle p-1 text-white" style={{ width: 28, height: 28 }}>
                              {savingId === d.DistrictId ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
                            </Button>
                            <Button size="sm" variant="danger" onClick={cancelEdit} className="rounded-circle p-1" style={{ width: 28, height: 28 }}>
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDoubleClick(d)}>
                              <Edit size={14} className="text-muted" />
                            </Button>
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDelete(d.DistrictId)}>
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

            {/* Mobile */}
            <div className="d-block d-md-none">
              {districts.map(d => {
                const editing = editingId === d.DistrictId;
                return (
                  <div key={d.DistrictId} className={`p-3 border-bottom ${editing ? 'bg-success bg-opacity-10' : ''}`} onDoubleClick={() => !editing && handleDoubleClick(d)}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold">{d.DistrictName}</span>
                      <Badge bg={d.IsActive === 'Y' ? 'success' : 'secondary'}>{d.IsActive === 'Y' ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="small text-muted mb-1">{d.State?.StateName || getStateName(d.StateId)}, {d.Country?.CountryName || getCountryName(d.CountryId)}</div>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="light" className="flex-fill" onClick={() => handleDoubleClick(d)}><Edit size={14} className="me-1" />Edit</Button>
                      <Button size="sm" variant="light" className="flex-fill text-danger" onClick={() => handleDelete(d.DistrictId)}><Trash2 size={14} className="me-1" />Delete</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
      <div className="text-center mt-3"><small className="text-muted">✨ Double-click any row to quick edit</small></div>

      {/* Add District Modal */}
      <Modal show={showAddModal} onHide={() => { setShowAddModal(false); setAddStates([]); }} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add New District</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Country <span className="text-danger">*</span></Form.Label>
              <Form.Select value={addForm.country_id} onChange={e => handleAddCountryChange(e.target.value)}>
                <option value="">Select Country</option>
                {countries.map(c => <option key={c.CountryId} value={c.CountryId}>{c.CountryName}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">State <span className="text-danger">*</span></Form.Label>
              <Form.Select value={addForm.state_id} onChange={e => setAddForm(f => ({ ...f, state_id: e.target.value }))} disabled={!addForm.country_id}>
                <option value="">Select State</option>
                {addStates.map(s => <option key={s.StateId} value={s.StateId}>{s.StateName}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">District Name <span className="text-danger">*</span></Form.Label>
              <Form.Control placeholder="e.g. Panipat" value={addForm.district_name} onChange={e => setAddForm(f => ({ ...f, district_name: e.target.value }))} />
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
          <Button variant="light" className="rounded-pill px-4" onClick={() => { setShowAddModal(false); setAddStates([]); }}>Cancel</Button>
          <Button className="rounded-pill px-4 text-white" onClick={handleAdd} disabled={addSaving}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : 'Add District'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DistrictMasterPage;
