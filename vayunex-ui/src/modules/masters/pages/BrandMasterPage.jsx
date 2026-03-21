import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Button, Form, Row, Col, Badge, InputGroup, OverlayTrigger, Tooltip, Spinner, Dropdown } from 'react-bootstrap';
import { Plus, Search, Edit2, Check, X, Building } from 'lucide-react';
import * as brandService from '../../inventory/services/brandService';


const BrandMasterPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Inline Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newBrand, setNewBrand] = useState({ BrandName: '', IsActive: 'Y' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addInputRef = useRef(null);

  // Inline Edit State
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ BrandName: '', IsActive: 'Y' });

  useEffect(() => {
    fetchBrands();
  }, [search]);

  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAdding]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await brandService.getBrands(params);
      if (res.success) {
        setBrands(res.data);
      } else {
        setError(res.message);
        alert('Failed to load brands');
      }
    } catch (err) {
      setError('An error occurred while loading data');
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewBrand({ BrandName: '', IsActive: 'Y' });
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewBrand({ BrandName: '', IsActive: 'Y' });
  };

  const handleSaveAdd = async () => {
    if (!newBrand.BrandName.trim()) {
      alert('Brand Name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await brandService.createBrand({
        brandName: newBrand.BrandName.trim(),
        isActive: newBrand.IsActive
      });

      if (res.success) {
        alert('Brand added successfully');
        setIsAdding(false);
        fetchBrands();
      } else {
        alert(res.message || 'Failed to add brand');
      }
    } catch (err) {
      alert('Error adding brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoubleClick = (brand) => {
    setEditingId(brand.BrandId);
    setEditData({ BrandName: brand.BrandName, IsActive: brand.IsActive || 'Y' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    if (!editData.BrandName.trim()) {
      alert('Brand Name is required');
      return;
    }

    try {
      const res = await brandService.updateBrand(id, {
        brandName: editData.BrandName.trim(),
        isActive: editData.IsActive
      });

      if (res.success) {
        alert('Brand updated successfully');
        setEditingId(null);
        fetchBrands();
      } else {
        alert(res.message || 'Failed to update brand');
      }
    } catch (err) {
      alert('Error updating brand');
    }
  };

  let displayData = brands || [];
  if (search) {
      displayData = displayData.filter(b => 
          (b.BrandName || '').toLowerCase().includes(search.toLowerCase())
      );
  }

  return (
    <>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <Building size={28} className="text-primary" />
              Brand Master
            </h2>
            <p className="text-muted mb-0">Manage product brands with inline editing</p>
          </div>
          
          <Button 
            variant="primary" 
            className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2 transition-all hover-lift"
            onClick={handleStartAdd}
            disabled={isAdding}
          >
            <Plus size={18} /> Add Brand
          </Button>
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <Card.Body className="p-4">
            <Row className="g-3 align-items-center bg-light p-3 rounded-3 mb-4">
              <Col xs={12} md={6}>
                <InputGroup className="border-0 shadow-sm rounded-pill overflow-hidden bg-white">
                  <InputGroup.Text className="bg-transparent border-0 pe-2">
                    <Search size={18} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search brand name..."
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
                    <th className="py-3 text-secondary ps-4" style={{ width: '40%' }}>Brand Name</th>
                    <th className="py-3 text-secondary text-center" style={{ width: '25%' }}>Status</th>
                    <th className="py-3 text-secondary text-end pe-4" style={{ width: '35%' }}>Actions / Hint</th>
                  </tr>
                </thead>
                <tbody>
                  {isAdding && (
                    <tr className="bg-primary bg-opacity-10 add-row-animation">
                      <td className="ps-4">
                        <Form.Control
                          ref={addInputRef}
                          autoFocus
                          placeholder="Enter Brand Name"
                          value={newBrand.BrandName}
                          onChange={(e) => setNewBrand({ ...newBrand, BrandName: e.target.value })}
                          className="shadow-sm border-primary"
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveAdd()}
                        />
                      </td>
                      <td className="text-center">
                        <Dropdown>
                            <Dropdown.Toggle variant={newBrand.IsActive === 'Y' ? 'outline-success' : 'outline-danger'} size="sm" className="rounded-pill w-100 fw-bold">
                                {newBrand.IsActive === 'Y' ? 'Active' : 'Inactive'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm rounded-3">
                                <Dropdown.Item onClick={() => setNewBrand({...newBrand, IsActive: 'Y'})}>Active</Dropdown.Item>
                                <Dropdown.Item onClick={() => setNewBrand({...newBrand, IsActive: 'N'})}>Inactive</Dropdown.Item>
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

                  {loading && !isAdding && brands.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-2 mb-0">Loading brands...</p>
                      </td>
                    </tr>
                  ) : displayData.length === 0 && !isAdding ? (
                    <tr>
                      <td colSpan="3" className="text-center py-5">
                        <img src="https://cdni.iconscout.com/illustration/premium/thumb/folder-is-empty-illustration-download-in-svg-png-gif-file-formats--no-data-record-miscellaneous-pack-illustrations-3112448.png" alt="No Data" style={{ width: '150px', opacity: 0.6 }} />
                        <h5 className="mt-3 text-muted">No Brands Found</h5>
                        <p className="text-muted mb-3">Try specific search keywords or add a new brand.</p>
                      </td>
                    </tr>
                  ) : (
                    displayData.map((brand) => (
                      <tr 
                        key={brand.BrandId}
                        onDoubleClick={() => handleDoubleClick(brand)}
                        className={editingId === brand.BrandId ? 'bg-light' : 'cursor-pointer hover-bg-light transition-all'}
                      >
                        <td className="ps-4">
                          {editingId === brand.BrandId ? (
                            <Form.Control
                              autoFocus
                              value={editData.BrandName}
                              onChange={(e) => setEditData({ ...editData, BrandName: e.target.value })}
                              className="shadow-sm border-primary"
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(brand.BrandId)}
                            />
                          ) : (
                            <span className="fw-medium text-dark">{brand.BrandName}</span>
                          )}
                        </td>
                        <td className="text-center">
                          {editingId === brand.BrandId ? (
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
                              bg={brand.IsActive === 'Y' ? 'success' : 'danger'} 
                              className="rounded-pill px-3 py-2 fw-medium bg-opacity-10"
                              text={brand.IsActive === 'Y' ? 'success' : 'danger'}
                            >
                              {brand.IsActive === 'Y' ? 'Active' : 'Inactive'}
                            </Badge>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          {editingId === brand.BrandId ? (
                            <div className="d-flex justify-content-end gap-2">
                              <Button 
                                variant="success" 
                                size="sm" 
                                className="rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm"
                                onClick={() => handleSaveEdit(brand.BrandId)}
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

export default BrandMasterPage;
