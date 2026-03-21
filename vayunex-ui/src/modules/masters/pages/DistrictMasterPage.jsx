import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Button, Form, Row, Col, Badge, InputGroup, Dropdown, Spinner } from 'react-bootstrap';
import { Plus, Search, Edit2, Check, X, Map } from 'lucide-react';
import * as districtService from '../../inventory/services/districtService';
import apiClient from '../../../lib/apiClient';


const DistrictMasterPage = () => {
  const [districts, setDistricts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  
  // Inline Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newDistrict, setNewDistrict] = useState({ DistrictName: '', CountryId: '', StateId: '', IsActive: 'Y' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addStates, setAddStates] = useState([]);
  const addInputRef = useRef(null);

  // Inline Edit State
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ DistrictName: '', IsActive: 'Y' });

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
      setSelectedStateId(''); // Reset state when country changes
    } else {
      setStates([]);
      setSelectedStateId('');
    }
  }, [selectedCountryId]);

  // Main Grid Data Fetch
  useEffect(() => {
    fetchDistricts();
  }, [search, selectedCountryId, selectedStateId]);

  // Handle focus when row activates
  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAdding]);

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCountryId) params.append('country_id', selectedCountryId);
      if (selectedStateId) params.append('state_id', selectedStateId);

      const res = await districtService.getDistricts(params);
      if (res.success) {
        setDistricts(res.data);
      } else {
        setError(res.message);
        alert('Failed to load districts');
      }
    } catch (err) {
      setError('An error occurred while loading data');
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Add Form State Handlers (Independent from main filters if needed, but best if they default to filters)
  const handleCountryChangeAdd = async (e) => {
    const cid = e.target.value;
    setNewDistrict({ ...newDistrict, CountryId: cid, StateId: '' });
    if (cid) {
        try {
            const res = await apiClient.get(`/api/v1/inventory/states/dropdown?country_id=${cid}`);
            setAddStates(res.data || res || []);
        } catch { setAddStates([]); }
    } else {
        setAddStates([]);
    }
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewDistrict({ DistrictName: '', CountryId: selectedCountryId, StateId: selectedStateId, IsActive: 'Y' });
    if (selectedCountryId) {
       // populate addStates based on current filter so they match
       setAddStates(states); 
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleSaveAdd = async () => {
    if (!newDistrict.DistrictName.trim() || !newDistrict.CountryId || !newDistrict.StateId) {
      alert('District Name, Country, and State are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await districtService.createDistrict({
        districtName: newDistrict.DistrictName.trim(),
        countryId: newDistrict.CountryId,
        stateId: newDistrict.StateId,
        isActive: newDistrict.IsActive
      });

      if (res.success) {
        alert('District added successfully');
        setIsAdding(false);
        fetchDistricts();
      } else {
        alert(res.message || 'Failed to add district');
      }
    } catch (err) {
      alert('Error adding district');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoubleClick = (district) => {
    // Only simple inline edit for name/status (parent associations changing requires modal usually, keeping it simple here)
    setEditingId(district.DistrictId);
    setEditData({ DistrictName: district.DistrictName, IsActive: district.IsActive || 'Y' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    if (!editData.DistrictName.trim()) {
      alert('District Name is required');
      return;
    }

    try {
      const res = await districtService.updateDistrict(id, {
        districtName: editData.DistrictName.trim(),
        isActive: editData.IsActive
      });

      if (res.success) {
        alert('District updated successfully');
        setEditingId(null);
        fetchDistricts();
      } else {
        alert(res.message || 'Failed to update district');
      }
    } catch (err) {
      alert('Error updating district');
    }
  };

  let displayData = districts || [];
  if (search) {
      displayData = displayData.filter(d => 
          (d.DistrictName || '').toLowerCase().includes(search.toLowerCase())
      );
  }

  // Helper to find names
  const getCountryName = (id) => countries.find(c => c.CountryId === id)?.CountryName || '-';
  const getStateName = (id) => states.find(s => s.StateId === id)?.StateName || '-';

  return (
    <>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <Map size={28} className="text-primary" />
              District Master
            </h2>
            <p className="text-muted mb-0">Manage geographical districts linked to states</p>
          </div>
          
          <Button 
            variant="primary" 
            className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2 transition-all hover-lift"
            onClick={handleStartAdd}
            disabled={isAdding}
          >
            <Plus size={18} /> Add District
          </Button>
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <Card.Body className="p-4">
            <Row className="g-3 align-items-center bg-light p-3 rounded-3 mb-4">
              <Col xs={12} md={4}>
                <Form.Select 
                  value={selectedCountryId} 
                  onChange={(e) => setSelectedCountryId(e.target.value)}
                  className="border-0 shadow-sm rounded-pill"
                >
                  <option value="">All Countries</option>
                  {countries.map(c => (
                    <option key={c.CountryId} value={c.CountryId}>{c.CountryName}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={4}>
                <Form.Select 
                  value={selectedStateId} 
                  onChange={(e) => setSelectedStateId(e.target.value)}
                  className="border-0 shadow-sm rounded-pill"
                  disabled={!selectedCountryId}
                >
                  <option value="">All States</option>
                  {states.map(s => (
                    <option key={s.StateId} value={s.StateId}>{s.StateName}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={4}>
                <InputGroup className="border-0 shadow-sm rounded-pill overflow-hidden bg-white">
                  <InputGroup.Text className="bg-transparent border-0 pe-2">
                    <Search size={18} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search district name..."
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
                    <th className="py-3 text-secondary ps-4" style={{ width: '25%' }}>Country & State</th>
                    <th className="py-3 text-secondary" style={{ width: '30%' }}>District Name</th>
                    <th className="py-3 text-secondary text-center" style={{ width: '15%' }}>Status</th>
                    <th className="py-3 text-secondary text-end pe-4" style={{ width: '30%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isAdding && (
                    <tr className="bg-primary bg-opacity-10 add-row-animation">
                      <td className="ps-4">
                        <div className="d-flex flex-column gap-2 py-2">
                           <Form.Select 
                              size="sm"
                              value={newDistrict.CountryId}
                              onChange={handleCountryChangeAdd}
                              className="shadow-sm border-primary rounded-pill mb-1"
                            >
                              <option value="">Select Country</option>
                              {countries.map(c => <option key={c.CountryId} value={c.CountryId}>{c.CountryName}</option>)}
                            </Form.Select>
                            <Form.Select 
                              size="sm"
                              value={newDistrict.StateId}
                              onChange={(e) => setNewDistrict({...newDistrict, StateId: e.target.value})}
                              className="shadow-sm border-primary rounded-pill"
                              disabled={!newDistrict.CountryId}
                            >
                              <option value="">Select State</option>
                              {addStates.map(s => <option key={s.StateId} value={s.StateId}>{s.StateName}</option>)}
                            </Form.Select>
                        </div>
                      </td>
                      <td>
                        <Form.Control
                          ref={addInputRef}
                          autoFocus
                          placeholder="District Name"
                          value={newDistrict.DistrictName}
                          onChange={(e) => setNewDistrict({ ...newDistrict, DistrictName: e.target.value })}
                          className="shadow-sm border-primary"
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveAdd()}
                        />
                      </td>
                      <td className="text-center">
                        <Dropdown>
                            <Dropdown.Toggle variant={newDistrict.IsActive === 'Y' ? 'outline-success' : 'outline-danger'} size="sm" className="rounded-pill w-100 fw-bold">
                                {newDistrict.IsActive === 'Y' ? 'Active' : 'Inactive'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm rounded-3">
                                <Dropdown.Item onClick={() => setNewDistrict({...newDistrict, IsActive: 'Y'})}>Active</Dropdown.Item>
                                <Dropdown.Item onClick={() => setNewDistrict({...newDistrict, IsActive: 'N'})}>Inactive</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <Button 
                            variant="success" 
                            size="sm" 
                            className="rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm"
                            onClick={handleSaveAdd}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? <Spinner animation="border" size="sm" /> : <Check size={16} />}
                          </Button>
                          <Button 
                            variant="light" 
                            size="sm" 
                            className="rounded-circle d-flex align-items-center justify-content-center p-2 border shadow-sm text-danger"
                            onClick={handleCancelAdd}
                            disabled={isSubmitting}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {loading && !isAdding && districts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-2 mb-0">Loading districts...</p>
                      </td>
                    </tr>
                  ) : displayData.length === 0 && !isAdding ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <img src="https://cdni.iconscout.com/illustration/premium/thumb/folder-is-empty-illustration-download-in-svg-png-gif-file-formats--no-data-record-miscellaneous-pack-illustrations-3112448.png" alt="No Data" style={{ width: '150px', opacity: 0.6 }} />
                        <h5 className="mt-3 text-muted">No Districts Found</h5>
                        <p className="text-muted mb-3">Try different filters or add a new district.</p>
                      </td>
                    </tr>
                  ) : (
                    displayData.map((district) => (
                      <tr 
                        key={district.DistrictId}
                        onDoubleClick={() => handleDoubleClick(district)}
                        className={editingId === district.DistrictId ? 'bg-light' : 'cursor-pointer hover-bg-light transition-all'}
                      >
                        <td className="ps-4">
                           <div className="d-flex flex-column">
                              <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                                 {getCountryName(district.CountryId) || district.Country?.CountryName || `CID: ${district.CountryId}`}
                              </span>
                              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                 {getStateName(district.StateId) || district.State?.StateName || `SID: ${district.StateId}`}
                              </span>
                           </div>
                        </td>
                        <td>
                          {editingId === district.DistrictId ? (
                            <Form.Control
                              autoFocus
                              value={editData.DistrictName}
                              onChange={(e) => setEditData({ ...editData, DistrictName: e.target.value })}
                              className="shadow-sm border-primary"
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(district.DistrictId)}
                            />
                          ) : (
                            <span className="fw-medium text-dark">{district.DistrictName}</span>
                          )}
                        </td>
                        <td className="text-center">
                          {editingId === district.DistrictId ? (
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
                            <Badge 
                              bg={district.IsActive === 'Y' ? 'success' : 'danger'} 
                              className="rounded-pill px-3 py-2 fw-medium bg-opacity-10"
                            >
                              {district.IsActive === 'Y' ? 'Active' : 'Inactive'}
                            </Badge>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          {editingId === district.DistrictId ? (
                            <div className="d-flex justify-content-end gap-2">
                              <Button 
                                variant="success" 
                                size="sm" 
                                className="rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm"
                                onClick={() => handleSaveEdit(district.DistrictId)}
                              >
                                <Check size={16} />
                              </Button>
                              <Button 
                                variant="light" 
                                size="sm" 
                                className="rounded-circle d-flex align-items-center justify-content-center p-2 border shadow-sm text-danger"
                                onClick={handleCancelEdit}
                              >
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

export default DistrictMasterPage;
