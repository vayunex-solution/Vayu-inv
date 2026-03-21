// src/modules/masters/pages/FyMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, Calendar, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../lib';

const FyMasterPage = () => {
  const [fys, setFys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ fy_name: '', fy_st_date: '', fy_end_date: '', is_current_fy: 'N' });
  const [addSaving, setAddSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchFys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/inventory/fy');
      const data = res.data || res || [];
      const filtered = search
        ? data.filter(f => (f.FyName || '').toLowerCase().includes(search.toLowerCase()))
        : data;
      setFys(filtered);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to load financial years', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchFys(); }, [fetchFys]);

  const handleDoubleClick = (fy) => {
    setEditingId(fy.FyId);
    setEditForm({
      fy_name: fy.FyName,
      fy_st_date: fy.FyStDate ? fy.FyStDate.substring(0, 10) : '',
      fy_end_date: fy.FyEndDate ? fy.FyEndDate.substring(0, 10) : '',
      is_current_fy: fy.IsCurrentFy || 'N',
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      setFys(prev => prev.map(f =>
        f.FyId === id ? { ...f, FyName: editForm.fy_name, IsCurrentFy: editForm.is_current_fy } : f
      ));
      await apiClient.put(`/api/v1/inventory/fy/${id}`, editForm);
      showAlert('Financial Year updated successfully');
    } catch (err) {
      fetchFys();
      showAlert(err.response?.data?.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this financial year?')) return;
    const prev = [...fys];
    setFys(fys.filter(f => f.FyId !== id));
    try {
      await apiClient.delete(`/api/v1/inventory/fy/${id}`);
      showAlert('Financial Year deleted');
    } catch (err) {
      setFys(prev);
      showAlert(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const handleAdd = async () => {
    if (!addForm.fy_name.trim() || !addForm.fy_st_date || !addForm.fy_end_date) {
      showAlert('FY Name, Start Date and End Date are required', 'danger'); return;
    }
    setAddSaving(true);
    try {
      await apiClient.post('/api/v1/inventory/fy', addForm);
      setShowAddModal(false);
      setAddForm({ fy_name: '', fy_st_date: '', fy_end_date: '', is_current_fy: 'N' });
      fetchFys();
      showAlert('Financial Year added successfully');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to add financial year', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="container-fluid p-0">
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible position-fixed top-0 end-0 m-3 shadow`} style={{ zIndex: 9999 }}>
          {alert.msg}
        </div>
      )}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Financial Year Master
          </h4>
          <p className="text-muted small mb-0">{fys.length} financial years configured</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" className="rounded-pill" onClick={fetchFys} title="Refresh">
            <RefreshCw size={16} />
          </Button>
          <Button className="d-flex align-items-center gap-2 rounded-pill shadow-sm text-white" onClick={() => setShowAddModal(true)}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
            <Plus size={18} /> Add FY
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-4" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
        <Card.Body className="py-3">
          <Row className="g-2">
            <Col xs={12} md={8}>
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0"><Search size={16} className="text-muted" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search by financial year name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent border-start-0 shadow-none"
                />
                {search && <Button variant="light" onClick={() => setSearch('')}><X size={14} /></Button>}
              </InputGroup>
            </Col>
            <Col xs={12} md={4}>
              <Button variant="outline-secondary" className="w-100 rounded-pill" onClick={() => setSearch('')}>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <Spinner animation="border" style={{ color: '#f59e0b' }} />
          </div>
        ) : fys.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <Calendar size={48} className="mb-3 opacity-25" />
            <p>No financial years found. Click "Add FY" to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 d-none d-md-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">FY Name</th>
                  <th className="border-0">Start Date</th>
                  <th className="border-0">End Date</th>
                  <th className="border-0 text-center">Current FY</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fys.map((f, idx) => {
                  const editing = editingId === f.FyId;
                  return (
                    <tr key={f.FyId} onDoubleClick={() => !editing && handleDoubleClick(f)}
                        style={{ cursor: editing ? 'default' : 'pointer' }}
                        className={editing ? 'table-warning bg-opacity-25' : ''}
                        title={!editing ? 'Double-click to edit' : ''}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #f59e0b20, #d9770620)' }}>
                            <Calendar size={16} style={{ color: '#f59e0b' }} />
                          </div>
                          {editing
                            ? <Form.Control size="sm" value={editForm.fy_name} onChange={e => setEditForm(f => ({ ...f, fy_name: e.target.value }))} autoFocus />
                            : <span className="fw-semibold">{f.FyName}</span>}
                        </div>
                      </td>
                      <td>
                        {editing
                          ? <Form.Control type="date" size="sm" style={{ width: 150 }} value={editForm.fy_st_date} onChange={e => setEditForm(form => ({ ...form, fy_st_date: e.target.value }))} />
                          : <span className="small">{formatDate(f.FyStDate)}</span>}
                      </td>
                      <td>
                        {editing
                          ? <Form.Control type="date" size="sm" style={{ width: 150 }} value={editForm.fy_end_date} onChange={e => setEditForm(form => ({ ...form, fy_end_date: e.target.value }))} />
                          : <span className="small">{formatDate(f.FyEndDate)}</span>}
                      </td>
                      <td className="text-center">
                        {editing
                          ? <Form.Select size="sm" style={{ width: 110 }} value={editForm.is_current_fy} onChange={e => setEditForm(form => ({ ...form, is_current_fy: e.target.value }))}>
                              <option value="Y">Yes</option>
                              <option value="N">No</option>
                            </Form.Select>
                          : <Badge bg={f.IsCurrentFy === 'Y' ? 'warning' : 'secondary'} text={f.IsCurrentFy === 'Y' ? 'dark' : 'white'} className="fw-normal rounded-pill px-3">
                              {f.IsCurrentFy === 'Y' ? 'Current' : 'Past'}
                            </Badge>}
                      </td>
                      <td className="text-end">
                        {editing ? (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="warning" onClick={() => saveEdit(f.FyId)} disabled={savingId === f.FyId} className="rounded-circle p-1 text-white" style={{ width: 28, height: 28 }}>
                              {savingId === f.FyId ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
                            </Button>
                            <Button size="sm" variant="danger" onClick={cancelEdit} className="rounded-circle p-1" style={{ width: 28, height: 28 }}>
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDoubleClick(f)}>
                              <Edit size={14} className="text-muted" />
                            </Button>
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDelete(f.FyId)}>
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
              {fys.map(f => {
                const editing = editingId === f.FyId;
                return (
                  <div key={f.FyId} className={`p-3 border-bottom ${editing ? 'bg-warning bg-opacity-10' : ''}`} onDoubleClick={() => !editing && handleDoubleClick(f)}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <Calendar size={18} style={{ color: '#f59e0b' }} />
                        <span className="fw-semibold">{f.FyName}</span>
                      </div>
                      <Badge bg={f.IsCurrentFy === 'Y' ? 'warning' : 'secondary'} text={f.IsCurrentFy === 'Y' ? 'dark' : 'white'}>
                        {f.IsCurrentFy === 'Y' ? 'Current' : 'Past'}
                      </Badge>
                    </div>
                    <div className="small text-muted mb-2">{formatDate(f.FyStDate)} → {formatDate(f.FyEndDate)}</div>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="light" className="flex-fill" onClick={() => handleDoubleClick(f)}><Edit size={14} className="me-1" />Edit</Button>
                      <Button size="sm" variant="light" className="flex-fill text-danger" onClick={() => handleDelete(f.FyId)}><Trash2 size={14} className="me-1" />Delete</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
      <div className="text-center mt-3"><small className="text-muted">✨ Double-click any row to quick edit</small></div>

      {/* Add FY Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add Financial Year</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">FY Name <span className="text-danger">*</span></Form.Label>
              <Form.Control placeholder="e.g. 2025-26" value={addForm.fy_name} onChange={e => setAddForm(f => ({ ...f, fy_name: e.target.value }))} />
            </Form.Group>
            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Label className="fw-medium">Start Date <span className="text-danger">*</span></Form.Label>
                <Form.Control type="date" value={addForm.fy_st_date} onChange={e => setAddForm(f => ({ ...f, fy_st_date: e.target.value }))} />
              </Col>
              <Col xs={6}>
                <Form.Label className="fw-medium">End Date <span className="text-danger">*</span></Form.Label>
                <Form.Control type="date" value={addForm.fy_end_date} onChange={e => setAddForm(f => ({ ...f, fy_end_date: e.target.value }))} />
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Check type="switch" label="Mark as Current FY"
                checked={addForm.is_current_fy === 'Y'}
                onChange={e => setAddForm(f => ({ ...f, is_current_fy: e.target.checked ? 'Y' : 'N' }))} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button className="rounded-pill px-4 text-white" onClick={handleAdd} disabled={addSaving}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : 'Add FY'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FyMasterPage;
