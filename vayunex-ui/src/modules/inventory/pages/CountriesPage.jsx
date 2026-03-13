// src/modules/inventory/pages/CountriesPage.jsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, Globe } from 'lucide-react';
import { getCountries, updateCountry, deleteCountry, createCountry } from '../services/countryService';

const CountriesPage = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Double tap to edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await getCountries({ search });
      if (res.success) {
        const fetchedData = res.data?.items || res.data || [];
        setCountries(fetchedData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, [search]);

  // --- Double Tap to Edit Logic ---
  const handleDoubleClick = (country) => {
    if (editingId === country.id) return;
    setEditingId(country.id);
    setEditForm({ 
      country_code: country.country_code, 
      country_name: country.country_name,
      currency_code: country.currency_code,
      calling_code: country.calling_code,
      status: country.status || 'active'
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      // Optimistic UI update
      setCountries(prev => prev.map(c => 
        c.id === id ? { ...c, ...editForm } : c
      ));
      
      const res = await updateCountry(id, editForm);
      if (!res.success) {
        fetchCountries();
        alert('Failed to save changes');
      }
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this country?')) {
      const prevCountries = [...countries];
      setCountries(prev => prev.filter(c => c.id !== id));
      
      const res = await deleteCountry(id);
      if (!res.success) {
        setCountries(prevCountries);
        alert(res.error?.message || 'Failed to delete country');
      }
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 gradient-text">Manage Countries</h4>
          <p className="text-muted small mb-0">{countries.length} countries configured</p>
        </div>
        <Button variant="primary" className="btn-glossy d-flex align-items-center gap-2 rounded-pill shadow-sm">
          <Plus size={18} /> Add Country
        </Button>
      </div>

      {/* Filters (Glassmorphism Card) */}
      <Card className="glass-card mb-4 border-0">
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <InputGroup className="glass-input-group">
                <InputGroup.Text className="bg-transparent border-end-0 border-light">
                  <Search size={16} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search country name or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-start-0 border-light ps-0 shadow-none text-dark"
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Mobile Card View vs Desktop Table View */}
      <Card className="glass-card border-0 overflow-hidden">
        {loading && countries.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : countries.length === 0 ? (
          <div className="text-center p-5 text-muted">No countries found.</div>
        ) : (
          <div className="table-responsive">
            {/* Desktop Table View */}
            <Table hover className="align-middle mb-0 inventory-table d-none d-lg-table">
              <thead className="bg-light bg-opacity-50">
                <tr>
                  <th className="border-0">Country Name</th>
                  <th className="border-0">ISO Code</th>
                  <th className="border-0 text-center">Currency</th>
                  <th className="border-0 text-center">Dial Code</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((country) => {
                  const isEditing = editingId === country.id;
                  const isActive = country.status === 'active';
                  
                  return (
                    <tr 
                      key={country.id} 
                      onDoubleClick={() => !isEditing && handleDoubleClick(country)}
                      style={{ cursor: isEditing ? 'default' : 'pointer' }}
                      className={isEditing ? 'table-active' : ''}
                      title={!isEditing ? "Double tap to edit" : ""}
                    >
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 d-none d-sm-flex justify-content-center align-items-center" style={{ width: '36px', height: '36px' }}>
                            <Globe size={18} />
                          </div>
                          <div>
                            {isEditing ? (
                               <Form.Control size="sm" value={editForm.country_name} onChange={(e) => handleEditChange('country_name', e.target.value)} />
                            ) : (
                               <div className="fw-bold text-dark">{country.country_name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ width: '120px' }}>
                        {isEditing ? (
                          <Form.Control size="sm" value={editForm.country_code} onChange={(e) => handleEditChange('country_code', e.target.value)} />
                        ) : (
                          <span className="font-monospace text-primary bg-primary bg-opacity-10 px-2 py-1 rounded small fw-bold">{country.country_code}</span>
                        )}
                      </td>
                      <td className="text-center" style={{ width: '120px' }}>
                        {isEditing ? (
                          <Form.Control size="sm" className="text-center" value={editForm.currency_code} onChange={(e) => handleEditChange('currency_code', e.target.value)} />
                        ) : (
                          <span className="fw-medium text-dark">{country.currency_code}</span>
                        )}
                      </td>
                      <td className="text-center" style={{ width: '120px' }}>
                        {isEditing ? (
                          <Form.Control size="sm" className="text-center" value={editForm.calling_code} onChange={(e) => handleEditChange('calling_code', e.target.value)} />
                        ) : (
                          <span className="text-muted">+{country.calling_code}</span>
                        )}
                      </td>
                      <td className="text-center" style={{ width: '120px' }}>
                         {isEditing ? (
                           <Form.Select size="sm" value={editForm.status || 'active'} onChange={(e) => handleEditChange('status', e.target.value)}>
                             <option value="active">Active</option>
                             <option value="inactive">Inactive</option>
                           </Form.Select>
                         ) : (
                           <Badge 
                             bg={isActive ? 'success' : 'secondary'} 
                             className="fw-normal rounded-pill px-3 py-2 bg-opacity-25"
                             style={{ color: isActive ? '#198754' : '#6c757d' }}
                           >
                             {isActive ? 'Active' : 'Inactive'}
                           </Badge>
                         )}
                      </td>
                      <td className="text-end">
                        {isEditing ? (
                          <div className="d-flex justify-content-end gap-2">
                             <Button variant="success" size="sm" onClick={() => saveEdit(country.id)} disabled={savingId === country.id} className="btn-icon rounded-circle p-1">
                                {savingId === country.id ? <Spinner size="sm" animation="border" /> : <Check size={16} />}
                             </Button>
                             <Button variant="danger" size="sm" onClick={cancelEdit} disabled={savingId === country.id} className="btn-icon rounded-circle p-1">
                                <X size={16} />
                             </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-1">
                            <Button variant="light" size="sm" className="btn-icon rounded-circle text-muted hover-glass" onClick={() => handleDoubleClick(country)}>
                              <Edit size={16} />
                            </Button>
                            <Button variant="light" size="sm" className="btn-icon rounded-circle text-danger hover-glass" onClick={() => handleDelete(country.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            {/* Mobile View Cards */}
            <div className="d-block d-lg-none mt-2">
               {countries.map(country => {
                 const isEditing = editingId === country.id;
                 const isActive = country.status === 'active';
                 
                 return (
                   <div key={country.id} className={`p-3 border-bottom ${isEditing ? 'bg-light' : ''}`} onDoubleClick={() => !isEditing && handleDoubleClick(country)}>
                     <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2">
                           <Globe size={18} className="text-primary" />
                           <div className="fw-bold">{country.country_name}</div>
                        </div>
                        <Badge bg={isActive ? 'success' : 'secondary'} className="bg-opacity-25" style={{ color: isActive ? '#198754' : '#6c757d' }}>
                           {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                     </div>
                     
                     {isEditing ? (
                       <div className="mb-3 p-3 bg-white rounded shadow-sm border mt-3">
                          <Row className="g-2 mb-2">
                            <Col xs={12}>
                              <Form.Label className="small text-muted mb-1">Country Name</Form.Label>
                              <Form.Control size="sm" value={editForm.country_name} onChange={(e) => handleEditChange('country_name', e.target.value)} />
                            </Col>
                            <Col xs={6}>
                              <Form.Label className="small text-muted mb-1">ISO Code</Form.Label>
                              <Form.Control size="sm" value={editForm.country_code} onChange={(e) => handleEditChange('country_code', e.target.value)} />
                            </Col>
                            <Col xs={6}>
                              <Form.Label className="small text-muted mb-1">Currency</Form.Label>
                              <Form.Control size="sm" value={editForm.currency_code} onChange={(e) => handleEditChange('currency_code', e.target.value)} />
                            </Col>
                            <Col xs={6}>
                              <Form.Label className="small text-muted mb-1">Dial Code</Form.Label>
                              <Form.Control size="sm" value={editForm.calling_code} onChange={(e) => handleEditChange('calling_code', e.target.value)} />
                            </Col>
                            <Col xs={6}>
                              <Form.Label className="small text-muted mb-1">Status</Form.Label>
                              <Form.Select size="sm" value={editForm.status || 'active'} onChange={(e) => handleEditChange('status', e.target.value)}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </Form.Select>
                            </Col>
                          </Row>
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="danger" size="sm" className="flex-fill rounded-pill" onClick={cancelEdit}>Cancel</Button>
                            <Button variant="success" size="sm" className="flex-fill rounded-pill" onClick={() => saveEdit(country.id)} disabled={savingId === country.id}>Save</Button>
                          </div>
                       </div>
                     ) : (
                       <div className="d-flex justify-content-between align-items-center mt-3 bg-light rounded p-2 px-3 small">
                           <div className="text-center">
                               <div className="text-muted" style={{ fontSize: '0.7rem' }}>CODE</div>
                               <div className="fw-bold text-primary font-monospace">{country.country_code}</div>
                           </div>
                           <div className="text-center">
                               <div className="text-muted" style={{ fontSize: '0.7rem' }}>CURRENCY</div>
                               <div className="fw-bold">{country.currency_code}</div>
                           </div>
                           <div className="text-center">
                               <div className="text-muted" style={{ fontSize: '0.7rem' }}>DIAL</div>
                               <div className="fw-bold">+{country.calling_code}</div>
                           </div>
                       </div>
                     )}
                     
                     {!isEditing && (
                       <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                          <Button variant="light" size="sm" className="flex-fill text-muted" onClick={() => handleDoubleClick(country)}>
                            <Edit size={16} className="me-1" /> Edit
                          </Button>
                          <Button variant="light" size="sm" className="flex-fill text-danger" onClick={() => handleDelete(country.id)}>
                            <Trash2 size={16} className="me-1" /> Delete
                          </Button>
                       </div>
                     )}
                   </div>
                 );
               })}
            </div>
          </div>
        )}
      </Card>
      
      <div className="d-flex justify-content-center mt-4">
          <small className="text-muted text-center d-block">✨ Tip: Double tap any country row to quick edit</small>
      </div>
    </div>
  );
};

export default CountriesPage;
