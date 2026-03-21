// src/modules/masters/pages/CityMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, Building2, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../lib';

const CityMasterPage = () => {
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ city_name: '', country_id: '', state_id: '', district_id: '', pincode: '', is_active: 'Y' });
  const [addStates, setAddStates] = useState([]);
  const [addDistricts, setAddDistricts] = useState([]);
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

  // Filter: states when country changes
  useEffect(() => {
    if (selectedCountryId) {
      apiClient.get(`/api/v1/inventory/states/dropdown?country_id=${selectedCountryId}`)
        .then(res => setStates(res.data || res || []))
        .catch(() => {});
      setSelectedStateId('');
      setDistricts([]);
    } else {
      setStates([]);
      setSelectedStateId('');
      setDistricts([]);
    }
  }, [selectedCountryId]);

  // Filter: districts when state changes
  useEffect(() => {
    if (selectedStateId) {
      apiClient.get(`/api/v1/inventory/districts/dropdown?state_id=${selectedStateId}`)
        .then(res => setDistricts(res.data || res || []))
        .catch(() => {});
    } else {
      setDistricts([]);
    }
  }, [selectedStateId]);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStateId) params.append('state_id', selectedStateId);
      const res = await apiClient.get(`/api/v1/inventory/cities?${params.toString()}`);
      const data = res.data || res || [];
      const filtered = search
        ? data.filter(c =>
            (c.CityName || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.Pincode || '').toLowerCase().includes(search.toLowerCase())
          )
        : data;
      setCities(filtered);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to load cities', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search, selectedStateId]);

  useEffect(() => { fetchCities(); }, [fetchCities]);

  // Add Modal: state/district cascades
  const handleAddCountryChange = async (cid) => {
    setAddForm(f => ({ ...f, country_id: cid, state_id: '', district_id: '' }));
    setAddStates([]);
    setAddDistricts([]);
    if (cid) {
      try {
        const res = await apiClient.get(`/api/v1/inventory/states/dropdown?country_id=${cid}`);
        setAddStates(res.data || res || []);
      } catch { setAddStates([]); }
    }
  };

  const handleAddStateChange = async (sid) => {
    setAddForm(f => ({ ...f, state_id: sid, district_id: '' }));
    setAddDistricts([]);
    if (sid) {
      try {
        const res = await apiClient.get(`/api/v1/inventory/districts/dropdown?state_id=${sid}`);
        setAddDistricts(res.data || res || []);
      } catch { setAddDistricts([]); }
    }
  };

  const handleDoubleClick = (c) => {
    setEditingId(c.CityId);
    setEditForm({
      city_name: c.CityName,
      pincode: c.Pincode || '',
      is_active: c.IsActive || 'Y',
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      setCities(prev => prev.map(c =>
        c.CityId === id ? { ...c, CityName: editForm.city_name, Pincode: editForm.pincode, IsActive: editForm.is_active } : c
      ));
      await apiClient.put(`/api/v1/inventory/cities/${id}`, editForm);
      showAlert('City updated successfully');
    } catch (err) {
      fetchCities();
      showAlert(err.response?.data?.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this city?')) return;
    const prev = [...cities];
    setCities(cities.filter(c => c.CityId !== id));
    try {
      await apiClient.delete(`/api/v1/inventory/cities/${id}`);
      showAlert('City deleted');
    } catch (err) {
      setCities(prev);
      showAlert(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const handleAdd = async () => {
    if (!addForm.country_id || !addForm.state_id || !addForm.city_name.trim()) {
      showAlert('Country, State and City Name are required', 'danger'); return;
    }
    setAddSaving(true);
    try {
      await apiClient.post('/api/v1/inventory/cities', addForm);
      setShowAddModal(false);
      setAddForm({ city_name: '', country_id: '', state_id: '', district_id: '', pincode: '', is_active: 'Y' });
      setAddStates([]);
      setAddDistricts([]);
      fetchCities();
      showAlert('City added successfully');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to add city', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

  const getStateName = (id) => states.find(s => s.StateId === id)?.StateName || null;
  const getCountryName = (id) => countries.find(c => c.CountryId === id)?.CountryName || null;
  const getDistrictName = (id) => districts.find(d => d.DistrictId === id)?.DistrictName || null;

  return (
    <div className="container-fluid p-0">
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible position-fixed top-0 end-0 m-3 shadow`} style={{ zIndex: 9999 }}>
          {alert.msg}
        </div>
      )}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            City Master
          </h4>
          <p className="text-muted small mb-0">{cities.length} cities configured</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" className="rounded-pill" onClick={fetchCities} title="Refresh">
            <RefreshCw size={16} />
          </Button>
          <Button variant="info" className="d-flex align-items-center gap-2 rounded-pill shadow-sm text-white" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add City
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-4" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
        <Card.Body className="py-3">
          <Row className="g-2">
            <Col xs={12} md={3}>
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0"><Search size={16} className="text-muted" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search city / pincode..."
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
            <Col xs={12} md={3}>
              <Button variant="outline-secondary" className="w-100 rounded-pill" onClick={() => { setSearch(''); setSelectedCountryId(''); setSelectedStateId(''); }}>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <Spinner animation="border" variant="info" />
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <Building2 size={48} className="mb-3 opacity-25" />
            <p>No cities found. Adjust filters or add a new city.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 d-none d-md-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">City Name</th>
                  <th className="border-0">Pincode</th>
                  <th className="border-0">District / State</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((c, idx) => {
                  const editing = editingId === c.CityId;
                  return (
                    <tr key={c.CityId} onDoubleClick={() => !editing && handleDoubleClick(c)}
                        style={{ cursor: editing ? 'default' : 'pointer' }}
                        className={editing ? 'table-info bg-opacity-25' : ''}
                        title={!editing ? 'Double-click to edit' : ''}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                            <Building2 size={16} className="text-info" />
                          </div>
                          {editing
                            ? <Form.Control size="sm" value={editForm.city_name} onChange={e => setEditForm(f => ({ ...f, city_name: e.target.value }))} autoFocus />
                            : <span className="fw-semibold">{c.CityName}</span>}
                        </div>
                      </td>
                      <td>
                        {editing
                          ? <Form.Control size="sm" style={{ width: 100 }} placeholder="Pincode" value={editForm.pincode} onChange={e => setEditForm(f => ({ ...f, pincode: e.target.value }))} />
                          : <code className="bg-info bg-opacity-10 text-info px-2 py-1 rounded small fw-bold">{c.Pincode || '—'}</code>}
                      </td>
                      <td>
                        <div>
                          <span className="badge bg-secondary bg-opacity-10 text-secondary fw-normal rounded-pill px-2 me-1">
                            {c.District?.DistrictName || getDistrictName(c.DistrictId) || '—'}
                          </span>
                          <span className="badge bg-secondary bg-opacity-10 text-secondary fw-normal rounded-pill px-2">
                            {c.State?.StateName || getStateName(c.StateId) || `State #${c.StateId}`}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        {editing
                          ? <Form.Select size="sm" style={{ width: 110 }} value={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.value }))}>
                              <option value="Y">Active</option>
                              <option value="N">Inactive</option>
                            </Form.Select>
                          : <Badge bg={c.IsActive === 'Y' ? 'success' : 'secondary'} className="fw-normal rounded-pill px-3">{c.IsActive === 'Y' ? 'Active' : 'Inactive'}</Badge>}
                      </td>
                      <td className="text-end">
                        {editing ? (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="info" onClick={() => saveEdit(c.CityId)} disabled={savingId === c.CityId} className="rounded-circle p-1 text-white" style={{ width: 28, height: 28 }}>
                              {savingId === c.CityId ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
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
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDelete(c.CityId)}>
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
              {cities.map(c => {
                const editing = editingId === c.CityId;
                return (
                  <div key={c.CityId} className={`p-3 border-bottom ${editing ? 'bg-info bg-opacity-10' : ''}`} onDoubleClick={() => !editing && handleDoubleClick(c)}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold">{c.CityName}</span>
                      <Badge bg={c.IsActive === 'Y' ? 'success' : 'secondary'}>{c.IsActive === 'Y' ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    {c.Pincode && <div className="small text-muted mb-1">Pincode: <code className="text-info">{c.Pincode}</code></div>}
                    <div className="small text-muted mb-2">
                      {c.District?.DistrictName || '—'} • {c.State?.StateName || getStateName(c.StateId) || '—'} • {c.Country?.CountryName || getCountryName(c.CountryId) || '—'}
                    </div>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="light" className="flex-fill" onClick={() => handleDoubleClick(c)}><Edit size={14} className="me-1" />Edit</Button>
                      <Button size="sm" variant="light" className="flex-fill text-danger" onClick={() => handleDelete(c.CityId)}><Trash2 size={14} className="me-1" />Delete</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
      <div className="text-center mt-3"><small className="text-muted">✨ Double-click any row to quick edit</small></div>

      {/* Add City Modal */}
      <Modal show={showAddModal} onHide={() => { setShowAddModal(false); setAddStates([]); setAddDistricts([]); }} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add New City</Modal.Title>
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
              <Form.Select value={addForm.state_id} onChange={e => handleAddStateChange(e.target.value)} disabled={!addForm.country_id}>
                <option value="">Select State</option>
                {addStates.map(s => <option key={s.StateId} value={s.StateId}>{s.StateName}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">District <span className="text-muted small">(Optional)</span></Form.Label>
              <Form.Select value={addForm.district_id} onChange={e => setAddForm(f => ({ ...f, district_id: e.target.value }))} disabled={!addForm.state_id}>
                <option value="">Select District</option>
                {addDistricts.map(d => <option key={d.DistrictId} value={d.DistrictId}>{d.DistrictName}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">City Name <span className="text-danger">*</span></Form.Label>
              <Form.Control placeholder="e.g. Panipat" value={addForm.city_name} onChange={e => setAddForm(f => ({ ...f, city_name: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Pincode</Form.Label>
              <Form.Control placeholder="e.g. 132103" maxLength={10} value={addForm.pincode} onChange={e => setAddForm(f => ({ ...f, pincode: e.target.value }))} />
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
          <Button variant="light" className="rounded-pill px-4" onClick={() => { setShowAddModal(false); setAddStates([]); setAddDistricts([]); }}>Cancel</Button>
          <Button variant="info" className="rounded-pill px-4 text-white" onClick={handleAdd} disabled={addSaving}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : 'Add City'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CityMasterPage;
