import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../lib';

const BASE = '/api/v1/inventory/units';

const UnitMasterPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    unitCode: '', unitName: '', unitShortName: '', allowDecimal: 0, isActive: 1
  });
  const [addSaving, setAddSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`${BASE}?p_Start=0&p_End=1000`);
      // Backend sp usually returns uppercase fields if mapping isn't done at DTO
      setList(Array.isArray(res.data) ? res.data : []);
      setAlert(null);
    } catch (err) {
      setAlert({ type: 'danger', msg: err?.response?.data?.message || err.message || 'Failed to fetch Units' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setAddSaving(true);
      const payload = {
        unitCode: addForm.unitCode,
        unitName: addForm.unitName,
        unitShortName: addForm.unitShortName,
        allowDecimal: parseInt(addForm.allowDecimal, 10),
        isActive: parseInt(addForm.isActive, 10),
        createdBy: 1
      };
      await apiClient.post(BASE, payload);
      setAddForm({ unitCode: '', unitName: '', unitShortName: '', allowDecimal: 0, isActive: 1 });
      setShowAddModal(false);
      setAlert({ type: 'success', msg: 'Unit added successfully!' });
      fetchList();
    } catch (err) {
      setAlert({ type: 'danger', msg: err?.response?.data?.message || err.message || 'Error saving Unit' });
    } finally {
      setAddSaving(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.UnitId || item.unitId);
    setEditForm({
      unitId: item.UnitId || item.unitId,
      unitCode: item.UnitCode || item.unitCode || '',
      unitName: item.UnitName || item.unitName || '',
      unitShortName: item.UnitShortName || item.unitShortName || '',
      allowDecimal: item.AllowDecimal !== undefined ? item.AllowDecimal : (item.allowDecimal || 0),
      isActive: item.IsActive !== undefined ? item.IsActive : (item.isActive || 1)
    });
  };

  const handleSaveEdit = async () => {
    try {
      setSavingId(editingId);
      const payload = {
        ...editForm,
        allowDecimal: parseInt(editForm.allowDecimal, 10),
        isActive: parseInt(editForm.isActive, 10),
        modifiedBy: 1
      };
      await apiClient.put(`${BASE}/${editingId}`, payload);
      setEditingId(null);
      setAlert({ type: 'success', msg: 'Unit updated successfully!' });
      fetchList();
    } catch (err) {
      setAlert({ type: 'danger', msg: err?.response?.data?.message || err.message || 'Error updating Unit' });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Unit?')) return;
    try {
      setDeletingId(id);
      await apiClient.delete(`${BASE}/${id}`);
      setAlert({ type: 'success', msg: 'Unit deleted successfully!' });
      fetchList();
    } catch (err) {
      setAlert({ type: 'danger', msg: err?.response?.data?.message || err.message || 'Error deleting Unit' });
    } finally {
      setDeletingId(null);
    }
  };

  // Safe accessor handling both camelCase and PascalCase
  const filteredList = list.filter(item => {
    if (!search) return true;
    const term = search.toLowerCase();
    const c = (item.UnitCode || item.unitCode || '').toLowerCase();
    const n = (item.UnitName || item.unitName || '').toLowerCase();
    return c.includes(term) || n.includes(term);
  });

  return (
    <div className="state-master-container p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h4 className="fw-bold fs-4 mb-1" style={{ color: "var(--bs-primary)" }}>Unit Master</h4>
          <p className="text-muted mb-0 small">Manage units of measurement (UoM)</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" onClick={fetchList} disabled={loading} className="d-flex align-items-center gap-2 border">
            <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="d-flex align-items-center gap-2 shadow-sm rounded-3">
            <Plus size={18} /> Add Unit
          </Button>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show border-0 shadow-sm rounded-3`} role="alert">
          {alert.msg}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          <div className="bg-light p-3 border-bottom d-flex gap-3 align-items-center">
            <InputGroup className="w-auto me-auto" style={{ minWidth: '280px' }}>
              <InputGroup.Text className="bg-white border-end-0 text-muted">
                <Search size={16} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search units..."
                className="border-start-0 ps-0 shadow-none bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </div>

          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="px-4 text-secondary fw-semibold py-3" style={{ width: '15%' }}>Code</th>
                  <th className="text-secondary fw-semibold py-3" style={{ width: '30%' }}>Name</th>
                  <th className="text-secondary fw-semibold py-3" style={{ width: '20%' }}>Short Name</th>
                  <th className="text-secondary fw-semibold py-3" style={{ width: '10%' }}>Decimal</th>
                  <th className="text-secondary fw-semibold py-3" style={{ width: '10%' }}>Status</th>
                  <th className="text-secondary fw-semibold py-3 pe-4 text-end" style={{ width: '15%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted"><Spinner animation="border" size="sm" className="me-2" /> Loading units...</td></tr>
                ) : filteredList.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No units found. Click 'Add Unit' to create one.</td></tr>
                ) : (
                  filteredList.map((item) => {
                    const id = item.UnitId || item.unitId;
                    const code = item.UnitCode || item.unitCode;
                    const name = item.UnitName || item.unitName;
                    const short = item.UnitShortName || item.unitShortName;
                    const allowDec = item.AllowDecimal !== undefined ? item.AllowDecimal : item.allowDecimal;
                    const active = item.IsActive !== undefined ? item.IsActive : item.isActive;
                    const isEditing = editingId === id;

                    return (
                      <tr key={id} className={isEditing ? "table-primary-subtle" : ""}>
                        <td className="px-4 fw-medium text-dark">
                          {isEditing ? (
                            <Form.Control size="sm" value={editForm.unitCode} onChange={(e) => setEditForm({...editForm, unitCode: e.target.value})} autoFocus />
                          ) : code}
                        </td>
                        <td>
                          {isEditing ? (
                            <Form.Control size="sm" value={editForm.unitName} onChange={(e) => setEditForm({...editForm, unitName: e.target.value})} />
                          ) : name}
                        </td>
                        <td>
                          {isEditing ? (
                            <Form.Control size="sm" value={editForm.unitShortName} onChange={(e) => setEditForm({...editForm, unitShortName: e.target.value})} />
                          ) : short}
                        </td>
                        <td>
                          {isEditing ? (
                            <Form.Select size="sm" value={editForm.allowDecimal} onChange={(e) => setEditForm({...editForm, allowDecimal: e.target.value})}>
                              <option value={1}>Yes</option>
                              <option value={0}>No</option>
                            </Form.Select>
                          ) : (
                            <Badge bg={allowDec === 1 ? 'info' : 'secondary'} className="px-2 py-1 rounded-pill">{allowDec === 1 ? 'Yes' : 'No'}</Badge>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <Form.Select size="sm" value={editForm.isActive} onChange={(e) => setEditForm({...editForm, isActive: e.target.value})}>
                               <option value={1}>Active</option>
                               <option value={0}>Inactive</option>
                            </Form.Select>
                          ) : (
                            <Badge bg={active === 1 ? 'success' : 'danger'} className="px-2 py-1 rounded-pill fw-normal">{active === 1 ? 'Active' : 'Inactive'}</Badge>
                          )}
                        </td>
                        <td className="pe-4 text-end">
                          <div className="d-flex justify-content-end gap-2">
                            {isEditing ? (
                              <>
                                <Button variant="success" size="sm" onClick={handleSaveEdit} disabled={savingId === id} className="rounded-2 px-2 py-1">
                                  {savingId === id ? <Spinner size="sm" animation="border" /> : <Check size={15} />}
                                </Button>
                                <Button variant="light" size="sm" onClick={() => setEditingId(null)} disabled={savingId === id} className="rounded-2 px-2 py-1 border">
                                  <X size={15} />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button variant="light" size="sm" onClick={() => handleEditClick(item)} className="rounded-2 px-2 py-1 border text-secondary border-0 bg-transparent hover-bg-light">
                                  <Edit size={16} />
                                </Button>
                                <Button variant="light" size="sm" onClick={() => handleDelete(id)} disabled={deletingId === id} className="rounded-2 px-2 py-1 border text-danger border-0 bg-transparent hover-bg-light">
                                  {deletingId === id ? <Spinner size="sm" animation="border" /> : <Trash2 size={16} />}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fs-5 fw-bold text-dark">Add New Unit</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit}>
          <Modal.Body className="pt-3">
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Unit Code *</Form.Label>
                  <Form.Control 
                    required 
                    autoFocus
                    placeholder="e.g. PCS, KG"
                    value={addForm.unitCode} 
                    onChange={e => setAddForm({...addForm, unitCode: e.target.value.toUpperCase()})} 
                    className="shadow-none rounded-3"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Unit Name *</Form.Label>
                  <Form.Control 
                    required 
                    placeholder="e.g. Pieces, Kilograms"
                    value={addForm.unitName} 
                    onChange={e => setAddForm({...addForm, unitName: e.target.value})} 
                    className="shadow-none rounded-3"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Short Name</Form.Label>
                  <Form.Control 
                    placeholder="e.g. pc, kg"
                    value={addForm.unitShortName} 
                    onChange={e => setAddForm({...addForm, unitShortName: e.target.value})} 
                    className="shadow-none rounded-3"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Allow Decimal</Form.Label>
                  <Form.Select 
                    value={addForm.allowDecimal} 
                    onChange={e => setAddForm({...addForm, allowDecimal: e.target.value})}
                    className="shadow-none rounded-3"
                  >
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Status</Form.Label>
                  <Form.Select 
                    value={addForm.isActive} 
                    onChange={e => setAddForm({...addForm, isActive: e.target.value})}
                    className="shadow-none rounded-3"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-2">
            <Button variant="light" onClick={() => setShowAddModal(false)} className="rounded-3 border px-4">Cancel</Button>
            <Button variant="primary" type="submit" disabled={addSaving} className="rounded-3 px-4 shadow-sm">
              {addSaving ? <><Spinner size="sm" animation="border" className="me-2" /> Saving...</> : 'Save Unit'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UnitMasterPage;
