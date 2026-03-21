import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Button, Form, Row, Col, Badge, InputGroup, Dropdown, Spinner } from 'react-bootstrap';
import { Plus, Search, Edit2, Check, X, Building2 } from 'lucide-react';
import * as cityService from '../../inventory/services/cityService';
import apiClient from '../../../lib/apiClient';


const CityMasterPage = () => {
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  
  // Inline Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newCity, setNewCity] = useState({ CityName: '', CountryId: '', StateId: '', DistrictId: '', Pincode: '', IsActive: 'Y' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [addStates, setAddStates] = useState([]);
  const [addDistricts, setAddDistricts] = useState([]);
  const addInputRef = useRef(null);

  // Inline Edit State
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ CityName: '', Pincode: '', IsActive: 'Y' });

  // Initial Data Load (Countries)
  useEffect(() => {
    apiClient.get('/api/v1/inventory/countries/dropdown')
      .then(res => setCountries(res.data || res || []))
      .catch(() => alert('Failed to load countries'));
  }, []);

  // Filter Dropdowns
  useEffect(() => {
    if (selectedCountryId) {
      apiClient.get(`/api/v1/inventory/states/dropdown?country_id=${selectedCountryId}`)
        .then(res => setStates(res.data || res || []))
        .catch(() => {});
      setSelectedStateId('');
      setDistricts([]);
      setSelectedDistrictId('');
    } else {
      setStates([]);
      setSelectedStateId('');
      setDistricts([]);
      setSelectedDistrictId('');
    }
  }, [selectedCountryId]);

  useEffect(() => {
    if (selectedStateId) {
      apiClient.get(`/api/v1/inventory/districts/dropdown?state_id=${selectedStateId}`)
        .then(res => setDistricts(res.data || res || []))
        .catch(() => {});
      setSelectedDistrictId('');
    } else {
      setDistricts([]);
      setSelectedDistrictId('');
    }
  }, [selectedStateId]);

  // Main Grid Data Fetch
  useEffect(() => {
    fetchCities();
  }, [search, selectedCountryId, selectedStateId, selectedDistrictId]);

  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAdding]);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCountryId) params.append('country_id', selectedCountryId);
      if (selectedStateId) params.append('state_id', selectedStateId);
      if (selectedDistrictId) params.append('district_id', selectedDistrictId);

      const res = await cityService.getCities(params);
      if (res.success) {
        setCities(res.data);
      } else {
        setError(res.message);
        alert('Failed to load cities');
      }
    } catch (err) {
      setError('An error occurred while loading data');
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Add Form State Handlers
  const handleCountryChangeAdd = async (e) => {
    const cid = e.target.value;
    setNewCity({ ...newCity, CountryId: cid, StateId: '', DistrictId: '' });
    if (cid) {
        try {
            const res = await apiClient.get(`/api/v1/inventory/states/dropdown?country_id=${cid}`);
            setAddStates(res.data || res || []);
        } catch { setAddStates([]); }
    } else {
        setAddStates([]);
    }
    setAddDistricts([]);
  };

  const handleStateChangeAdd = async (e) => {
    const sid = e.target.value;
    setNewCity({ ...newCity, StateId: sid, DistrictId: '' });
    if (sid) {
        try {
            const res = await apiClient.get(`/api/v1/inventory/districts/dropdown?state_id=${sid}`);
            setAddDistricts(res.data || res || []);
        } catch { setAddDistricts([]); }
    } else {
        setAddDistricts([]);
    }
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewCity({ 
      CityName: '', 
      Pincode: '',
      CountryId: selectedCountryId, 
      StateId: selectedStateId, 
      DistrictId: selectedDistrictId, 
      IsActive: 'Y' 
    });
    
    if (selectedCountryId) setAddStates(states); 
    if (selectedStateId) setAddDistricts(districts);
  };

  const handleCancelAdd = () => setIsAdding(false);

  const handleSaveAdd = async () => {
    if (!newCity.CityName.trim() || !newCity.CountryId || !newCity.StateId || !newCity.DistrictId) {
      alert('City, District, State, and Country are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await cityService.createCity({
        cityName: newCity.CityName.trim(),
        countryId: newCity.CountryId,
        stateId: newCity.StateId,
        districtId: newCity.DistrictId,
        pincode: newCity.Pincode || null,
        isActive: newCity.IsActive
      });

      if (res.success) {
        alert('City added successfully');
        setIsAdding(false);
        fetchCities();
      } else {
        alert(res.message || 'Failed to add city');
      }
    } catch (err) {
      alert('Error adding city');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoubleClick = (city) => {
    setEditingId(city.CityId);
    setEditData({ 
        CityName: city.CityName, 
        Pincode: city.Pincode || '',
        IsActive: city.IsActive || 'Y' 
    });
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleSaveEdit = async (id) => {
    if (!editData.CityName.trim()) {
      alert('City Name is required');
      return;
    }

    try {
      const res = await cityService.updateCity(id, {
        cityName: editData.CityName.trim(),
        pincode: editData.Pincode || null,
        isActive: editData.IsActive
      });

      if (res.success) {
        alert('City updated successfully');
        setEditingId(null);
        fetchCities();
      } else {
        alert(res.message || 'Failed to update city');
      }
    } catch (err) {
      alert('Error updating city');
    }
  };

  let displayData = cities || [];
  if (search) {
      displayData = displayData.filter(c => 
          (c.CityName || '').toLowerCase().includes(search.toLowerCase()) ||
          (c.Pincode || '').toLowerCase().includes(search.toLowerCase())
      );
  }

  // Helpers
  const getCountryName = (id) => countries.find(c => c.CountryId === id)?.CountryName || null;
  const getStateName = (id) => states.find(s => s.StateId === id)?.StateName || null;
  const getDistrictName = (id) => districts.find(d => d.DistrictId === id)?.DistrictName || null;

  return (
    <>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <Building2 size={28} className="text-primary" />
              City Master
            </h2>
            <p className="text-muted mb-0">Manage cities, pincodes, and their hierarchy</p>
          </div>
          
          <Button 
            variant="primary" 
            className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2 transition-all hover-lift"
            onClick={handleStartAdd}
            disabled={isAdding}
          >
            <Plus size={18} /> Add City
          </Button>
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <Card.Body className="p-4">
            <Row className="g-3 align-items-center bg-light p-3 rounded-3 mb-4">
              <Col xs={12} md={3}>
                <Form.Select 
                  value={selectedCountryId} 
                  onChange={(e) => setSelectedCountryId(e.target.value)}
                  className="border-0 shadow-sm rounded-pill"
                >
                  <option value="">All Countries</option>
                  {countries.map(c => <option key={c.CountryId} value={c.CountryId}>{c.CountryName}</option>)}
                </Form.Select>
              </Col>
              <Col xs={12} md={3}>
                <Form.Select 
                  value={selectedStateId} 
                  onChange={(e) => setSelectedStateId(e.target.value)}
                  className="border-0 shadow-sm rounded-pill"
                  disabled={!selectedCountryId}
                >
                  <option value="">All States</option>
                  {states.map(s => <option key={s.StateId} value={s.StateId}>{s.StateName}</option>)}
                </Form.Select>
              </Col>
              <Col xs={12} md={3}>
                <Form.Select 
                  value={selectedDistrictId} 
                  onChange={(e) => setSelectedDistrictId(e.target.value)}
                  className="border-0 shadow-sm rounded-pill"
                  disabled={!selectedStateId}
                >
                  <option value="">All Districts</option>
                  {districts.map(d => <option key={d.DistrictId} value={d.DistrictId}>{d.DistrictName}</option>)}
                </Form.Select>
              </Col>
              <Col xs={12} md={3}>
                <InputGroup className="border-0 shadow-sm rounded-pill overflow-hidden bg-white">
                  <InputGroup.Text className="bg-transparent border-0 pe-2">
                    <Search size={18} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search city/pincode..."
                    className="border-0 shadow-none ps-0"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
            </Row>

            <div className="table-responsive">
              <Table hover className="align-middle mb-0 custom-table">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 text-secondary ps-4" style={{ width: '25%' }}>Hierarchy</th>
                    <th className="py-3 text-secondary" style={{ width: '25%' }}>City Details</th>
                    <th className="py-3 text-secondary text-center" style={{ width: '15%' }}>Status</th>
                    <th className="py-3 text-secondary text-end pe-4" style={{ width: '35%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isAdding && (
                    <tr className="bg-primary bg-opacity-10 add-row-animation">
                      <td className="ps-4">
                        <div className="d-flex flex-column gap-1 py-1">
                           <Form.Select size="sm" value={newCity.CountryId} onChange={handleCountryChangeAdd} className="shadow-sm border-primary rounded-pill">
                              <option value="">Select Country</option>
                              {countries.map(c => <option key={c.CountryId} value={c.CountryId}>{c.CountryName}</option>)}
                            </Form.Select>
                            <Form.Select size="sm" value={newCity.StateId} onChange={handleStateChangeAdd} className="shadow-sm border-primary rounded-pill" disabled={!newCity.CountryId}>
                              <option value="">Select State</option>
                              {addStates.map(s => <option key={s.StateId} value={s.StateId}>{s.StateName}</option>)}
                            </Form.Select>
                            <Form.Select size="sm" value={newCity.DistrictId} onChange={(e) => setNewCity({...newCity, DistrictId: e.target.value})} className="shadow-sm border-primary rounded-pill" disabled={!newCity.StateId}>
                              <option value="">Select District</option>
                              {addDistricts.map(d => <option key={d.DistrictId} value={d.DistrictId}>{d.DistrictName}</option>)}
                            </Form.Select>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-2">
                          <Form.Control ref={addInputRef} autoFocus placeholder="City Name" value={newCity.CityName} onChange={(e) => setNewCity({ ...newCity, CityName: e.target.value })} className="shadow-sm border-primary" onKeyDown={(e) => e.key === 'Enter' && handleSaveAdd()} />
                          <Form.Control placeholder="Pincode (Optional)" value={newCity.Pincode} onChange={(e) => setNewCity({ ...newCity, Pincode: e.target.value })} className="shadow-sm border-primary" onKeyDown={(e) => e.key === 'Enter' && handleSaveAdd()} />
                        </div>
                      </td>
                      <td className="text-center align-middle">
                        <Dropdown>
                            <Dropdown.Toggle variant={newCity.IsActive === 'Y' ? 'outline-success' : 'outline-danger'} size="sm" className="rounded-pill w-100 fw-bold">
                                {newCity.IsActive === 'Y' ? 'Active' : 'Inactive'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm rounded-3">
                                <Dropdown.Item onClick={() => setNewCity({...newCity, IsActive: 'Y'})}>Active</Dropdown.Item>
                                <Dropdown.Item onClick={() => setNewCity({...newCity, IsActive: 'N'})}>Inactive</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                      </td>
                      <td className="text-end pe-4 align-middle">
                        <div className="d-flex justify-content-end gap-2">
                          <Button variant="success" size="sm" className="rounded-circle p-2 shadow-sm" onClick={handleSaveAdd} disabled={isSubmitting}>
                            {isSubmitting ? <Spinner animation="border" size="sm" /> : <Check size={16} />}
                          </Button>
                          <Button variant="light" size="sm" className="rounded-circle p-2 border shadow-sm text-danger" onClick={handleCancelAdd} disabled={isSubmitting}>
                            <X size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {loading && !isAdding && cities.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-2 mb-0">Loading cities...</p>
                      </td>
                    </tr>
                  ) : displayData.length === 0 && !isAdding ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <img src="https://cdni.iconscout.com/illustration/premium/thumb/folder-is-empty-illustration-download-in-svg-png-gif-file-formats--no-data-record-miscellaneous-pack-illustrations-3112448.png" alt="No Data" style={{ width: '150px', opacity: 0.6 }} />
                        <h5 className="mt-3 text-muted">No Cities Found</h5>
                        <p className="text-muted mb-3">Try different filters or add a new city.</p>
                      </td>
                    </tr>
                  ) : (
                    displayData.map((city) => (
                      <tr 
                        key={city.CityId}
                        onDoubleClick={() => handleDoubleClick(city)}
                        className={editingId === city.CityId ? 'bg-light' : 'cursor-pointer hover-bg-light transition-all'}
                      >
                        <td className="ps-4">
                           <div className="d-flex flex-column gap-1">
                              <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                                 {city.District?.DistrictName || getDistrictName(city.DistrictId) || `District ID: ${city.DistrictId}`}
                              </span>
                              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                 {city.State?.StateName || getStateName(city.StateId) || `State ID: ${city.StateId}`}
                              </span>
                              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                 {city.Country?.CountryName || getCountryName(city.CountryId) || `Country ID: ${city.CountryId}`}
                              </span>
                           </div>
                        </td>
                        <td>
                          {editingId === city.CityId ? (
                             <div className="d-flex flex-column gap-2 py-2">
                                <Form.Control autoFocus value={editData.CityName} onChange={(e) => setEditData({ ...editData, CityName: e.target.value })} className="shadow-sm border-primary" />
                                <Form.Control placeholder="Pincode" value={editData.Pincode} onChange={(e) => setEditData({ ...editData, Pincode: e.target.value })} className="shadow-sm border-primary" onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(city.CityId)} />
                             </div>
                          ) : (
                             <div className="d-flex align-items-center gap-2">
                                <span className="fw-medium text-dark" style={{ fontSize: '1.05rem' }}>{city.CityName}</span>
                                {city.Pincode && <Badge bg="light" text="secondary" className="border">{city.Pincode}</Badge>}
                             </div>
                          )}
                        </td>
                        <td className="text-center">
                          {editingId === city.CityId ? (
                             <Dropdown>
                                <Dropdown.Toggle variant={editData.IsActive === 'Y' ? 'outline-success' : 'outline-danger'} size="sm" className="rounded-pill w-100 fw-bold">
                                    {editData.IsActive === 'Y' ? 'Active' : 'Inactive'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="shadow-sm rounded-3">
                                    <Dropdown.Item onClick={() => setEditData({...editData, IsActive: 'Y'})}>Active</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setEditData({...editData, IsActive: 'N'})}>Inactive</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                          ) : (
                            <Badge bg={city.IsActive === 'Y' ? 'success' : 'danger'} className="rounded-pill px-3 py-2 fw-medium bg-opacity-10">
                              {city.IsActive === 'Y' ? 'Active' : 'Inactive'}
                            </Badge>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          {editingId === city.CityId ? (
                            <div className="d-flex justify-content-end gap-2">
                              <Button variant="success" size="sm" className="rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center" onClick={() => handleSaveEdit(city.CityId)}>
                                <Check size={16} />
                              </Button>
                              <Button variant="light" size="sm" className="rounded-circle p-2 border shadow-sm text-danger d-flex align-items-center justify-content-center" onClick={handleCancelEdit}>
                                <X size={16} />
                              </Button>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center justify-content-end gap-3 opacity-50 hover-opacity-100 transition-all">
                                <span className="text-muted small d-none d-md-inline-flex align-items-center gap-1">
                                    <Edit2 size={12} /> Double-click to edit
                                </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </div>

      <style>{`
        .hover-lift:hover { transform: translateY(-2px); }
        .transition-all { transition: all 0.2s ease-in-out; }
        .cursor-pointer { cursor: pointer; }
        .hover-bg-light:hover { background-color: #f8f9fa !important; }
        .custom-table th { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e9ecef; }
        .custom-table td { border-bottom: 1px solid #f1f3f5; }
        .add-row-animation { animation: slideDown 0.3s ease-out; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hover-opacity-100:hover { opacity: 1 !important; }
      `}</style>
    </>
  );
};

export default CityMasterPage;
