import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Button, Form, Row, Col, Badge, InputGroup, Dropdown, Spinner } from 'react-bootstrap';
import { Plus, Search, Edit2, Check, X, Calendar } from 'lucide-react';
import * as fyService from '../../inventory/services/fyService';


const FyMasterPage = () => {
  const [fys, setFys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Inline Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newFy, setNewFy] = useState({ FYNAME: '', IsActive: 'Y', ISCURRENTFY: 'N' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addInputRef = useRef(null);

  // Inline Edit State
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ FYNAME: '', IsActive: 'Y', ISCURRENTFY: 'N' });

  useEffect(() => {
    fetchFys();
  }, [search]);

  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAdding]);

  const fetchFys = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fyService.getFys(params);
      if (res.success) {
        setFys(res.data);
      } else {
        setError(res.message);
        alert('Failed to load financial years');
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
    setNewFy({ FYNAME: '', IsActive: 'Y', ISCURRENTFY: 'N' });
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewFy({ FYNAME: '', IsActive: 'Y', ISCURRENTFY: 'N' });
  };

  const handleSaveAdd = async () => {
    if (!newFy.FYNAME.trim()) {
      alert('Financial Year Name is required (e.g. 2025-26)');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fyService.createFy({
        fyName: newFy.FYNAME.trim(),
        isActive: newFy.IsActive,
        isCurrentFy: newFy.ISCURRENTFY
      });

      if (res.success) {
        alert('Financial Year added successfully');
        setIsAdding(false);
        fetchFys();
      } else {
        alert(res.message || 'Failed to add financial year');
      }
    } catch (err) {
      alert('Error adding financial year');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoubleClick = (fy) => {
    setEditingId(fy.FYID);
    setEditData({ FYNAME: fy.FYNAME, IsActive: fy.IsActive || 'Y', ISCURRENTFY: fy.ISCURRENTFY || 'N' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    if (!editData.FYNAME.trim()) {
      alert('Financial Year Name is required');
      return;
    }

    try {
      const res = await fyService.updateFy(id, {
        fyName: editData.FYNAME.trim(),
        isActive: editData.IsActive,
        isCurrentFy: editData.ISCURRENTFY
      });

      if (res.success) {
        alert('Financial Year updated successfully');
        setEditingId(null);
        fetchFys();
      } else {
        alert(res.message || 'Failed to update financial year');
      }
    } catch (err) {
      alert('Error updating financial year');
    }
  };

  let displayData = fys || [];
  if (search) {
      displayData = displayData.filter(f => 
          (f.FYNAME || '').toLowerCase().includes(search.toLowerCase())
      );
  }

  return (
    <>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <Calendar size={28} className="text-primary" />
              Financial Year Master
            </h2>
            <p className="text-muted mb-0">Manage accounting periods with inline editing</p>
          </div>
          
          <Button 
            variant="primary" 
            className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2 transition-all hover-lift"
            onClick={handleStartAdd}
            disabled={isAdding}
          >
            <Plus size={18} /> Add FY
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
                    placeholder="Search financial year (e.g., 2025)..."
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
                    <th className="py-3 text-secondary ps-4" style={{ width: '30%' }}>Financial Year</th>
                    <th className="py-3 text-secondary text-center" style={{ width: '20%' }}>Current FY</th>
                    <th className="py-3 text-secondary text-center" style={{ width: '20%' }}>Status</th>
                    <th className="py-3 text-secondary text-end pe-4" style={{ width: '30%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isAdding && (
                    <tr className="bg-primary bg-opacity-10 add-row-animation">
                      <td className="ps-4">
                        <Form.Control
                          ref={addInputRef}
                          autoFocus
                          placeholder="e.g. 2025-26"
                          value={newFy.FYNAME}
                          onChange={(e) => setNewFy({ ...newFy, FYNAME: e.target.value })}
                          className="shadow-sm border-primary"
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveAdd()}
                        />
                      </td>
                      <td className="text-center">
                        <Dropdown>
                            <Dropdown.Toggle variant={newFy.ISCURRENTFY === 'Y' ? 'outline-primary' : 'outline-secondary'} size="sm" className="rounded-pill w-100 fw-bold">
                                {newFy.ISCURRENTFY === 'Y' ? 'Current FY' : 'Not Current'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm rounded-3">
                                <Dropdown.Item onClick={() => setNewFy({...newFy, ISCURRENTFY: 'Y'})}>Set as Current FY</Dropdown.Item>
                                <Dropdown.Item onClick={() => setNewFy({...newFy, ISCURRENTFY: 'N'})}>Not Current</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                      </td>
                      <td className="text-center">
                        <Dropdown>
                            <Dropdown.Toggle variant={newFy.IsActive === 'Y' ? 'outline-success' : 'outline-danger'} size="sm" className="rounded-pill w-100 fw-bold">
                                {newFy.IsActive === 'Y' ? 'Active' : 'Inactive'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm rounded-3">
                                <Dropdown.Item onClick={() => setNewFy({...newFy, IsActive: 'Y'})}>Active</Dropdown.Item>
                                <Dropdown.Item onClick={() => setNewFy({...newFy, IsActive: 'N'})}>Inactive</Dropdown.Item>
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

                  {loading && !isAdding && fys.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-2 mb-0">Loading financial years...</p>
                      </td>
                    </tr>
                  ) : displayData.length === 0 && !isAdding ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <img src="https://cdni.iconscout.com/illustration/premium/thumb/folder-is-empty-illustration-download-in-svg-png-gif-file-formats--no-data-record-miscellaneous-pack-illustrations-3112448.png" alt="No Data" style={{ width: '150px', opacity: 0.6 }} />
                        <h5 className="mt-3 text-muted">No FY Data Found</h5>
                        <p className="text-muted mb-3">Add a new financial year to get started.</p>
                      </td>
                    </tr>
                  ) : (
                    displayData.map((fy) => (
                      <tr 
                        key={fy.FYID}
                        onDoubleClick={() => handleDoubleClick(fy)}
                        className={editingId === fy.FYID ? 'bg-light' : 'cursor-pointer hover-bg-light transition-all'}
                      >
                        <td className="ps-4">
                          {editingId === fy.FYID ? (
                            <Form.Control
                              autoFocus
                              value={editData.FYNAME}
                              onChange={(e) => setEditData({ ...editData, FYNAME: e.target.value })}
                              className="shadow-sm border-primary"
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(fy.FYID)}
                            />
                          ) : (
                            <span className="fw-medium text-dark">{fy.FYNAME}</span>
                          )}
                        </td>
                        <td className="text-center">
                          {editingId === fy.FYID ? (
                             <Dropdown>
                                <Dropdown.Toggle variant={editData.ISCURRENTFY === 'Y' ? 'outline-primary' : 'outline-secondary'} size="sm" className="rounded-pill w-100 fw-bold">
                                    {editData.ISCURRENTFY === 'Y' ? 'Current FY' : 'Not Current'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="shadow-sm rounded-3">
                                    <Dropdown.Item onClick={() => setEditData({...editData, ISCURRENTFY: 'Y'})}>Set as Current FY</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setEditData({...editData, ISCURRENTFY: 'N'})}>Not Current</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                          ) : (
                            <Badge 
                              bg={fy.ISCURRENTFY === 'Y' ? 'primary' : 'secondary'} 
                              className="rounded-pill px-3 py-2 fw-medium bg-opacity-10"
                            >
                              {fy.ISCURRENTFY === 'Y' ? 'Current FY' : 'Standard FY'}
                            </Badge>
                          )}
                        </td>
                        <td className="text-center">
                          {editingId === fy.FYID ? (
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
                              bg={fy.IsActive === 'Y' ? 'success' : 'danger'} 
                              className="rounded-pill px-3 py-2 fw-medium bg-opacity-10"
                            >
                              {fy.IsActive === 'Y' ? 'Active' : 'Inactive'}
                            </Badge>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          {editingId === fy.FYID ? (
                            <div className="d-flex justify-content-end gap-2">
                              <Button 
                                variant="success" 
                                size="sm" 
                                className="rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm"
                                onClick={() => handleSaveEdit(fy.FYID)}
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

export default FyMasterPage;
