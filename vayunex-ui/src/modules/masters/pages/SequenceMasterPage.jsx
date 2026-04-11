// src/modules/masters/pages/SequenceMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, RefreshCw, Hash } from 'lucide-react';
import { apiClient } from '../../../lib';

const BASE = '/api/v1/inventory/sequences';

const SequenceMasterPage = () => {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null); // Will use HeadName as ID
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    headName: '',
    prefix: '',
    startValue: 1,
    stopValue: 99999,
    incrementValue: 1,
    lastValue: 0
  });
  const [addSaving, setAddSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const norm = (res) => {
    const raw = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    return raw.map(item => ({
      Serial: item.Serial || 0,
      HeadName: item.HeadName ?? item.headName ?? '',
      Prefix: item.Prefix ?? item.prefix ?? '',
      StartValue: parseInt(item.StartValue ?? item.startValue ?? 0, 10),
      StopValue: parseInt(item.StopValue ?? item.stopValue ?? 0, 10),
      IncrementValue: parseInt(item.IncrementValue ?? item.incrementValue ?? 0, 10),
      LastValue: parseInt(item.LastValue ?? item.lastValue ?? 0, 10),
    }));
  };

  const fetchSequences = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(BASE);
      let data = norm(res);
      if (search) {
        const s = search.toLowerCase();
        data = data.filter(seq => 
          seq.HeadName.toLowerCase().includes(s) || 
          seq.Prefix.toLowerCase().includes(s)
        );
      }
      setSequences(data);
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Failed to load sequences', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  const handleDoubleClick = (seq) => {
    setEditingId(seq.HeadName);
    setEditForm({
      headName: seq.HeadName,
      prefix: seq.Prefix,
      startValue: seq.StartValue,
      stopValue: seq.StopValue,
      incrementValue: seq.IncrementValue,
      lastValue: seq.LastValue
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (headName) => {
    setSavingId(headName);
    try {
      // Local optimistic update
      setSequences(prev => prev.map(s => 
        s.HeadName === headName 
          ? { ...s, Prefix: editForm.prefix, StartValue: editForm.startValue, StopValue: editForm.stopValue, IncrementValue: editForm.incrementValue, LastValue: editForm.lastValue }
          : s
      ));
      await apiClient.put(`${BASE}/${encodeURIComponent(headName)}`, editForm);
      showAlert('Sequence updated successfully');
    } catch (err) {
      fetchSequences(); // revert
      showAlert(err.response?.data?.message || err.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (headName) => {
    if (!window.confirm(`Delete sequence for head: ${headName}?`)) return;
    const prev = [...sequences];
    setSequences(sequences.filter(s => s.HeadName !== headName));
    try {
      await apiClient.delete(`${BASE}/${encodeURIComponent(headName)}`);
      showAlert('Sequence deleted');
    } catch (err) {
      setSequences(prev);
      showAlert(err.response?.data?.message || err.message || 'Delete failed', 'danger');
    }
  };

  const handleAdd = async () => {
    if (!addForm.headName.trim() || !addForm.prefix.trim()) {
      showAlert('Head Name and Prefix are required', 'danger');
      return;
    }
    setAddSaving(true);
    try {
      await apiClient.post(BASE, addForm);
      setShowAddModal(false);
      setAddForm({ headName: '', prefix: '', startValue: 1, stopValue: 99999, incrementValue: 1, lastValue: 0 });
      fetchSequences();
      showAlert('Sequence added successfully');
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Failed to add sequence', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

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
            <Hash size={22} className="me-2 text-info d-inline-block align-text-top" />
            Sequence Master
          </h4>
          <p className="text-muted small mb-0">{sequences.length} Document Sequences Configured</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" className="rounded-pill" onClick={fetchSequences} title="Refresh" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </Button>
          <Button variant="info" className="d-flex align-items-center gap-2 rounded-pill shadow-sm text-white" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Sequence
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-4" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
        <Card.Body className="py-3">
          <Row className="g-2">
            <Col xs={12} md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0"><Search size={16} className="text-muted" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search by Head Name or Prefix..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent border-start-0 shadow-none"
                />
                {search && <Button variant="light" onClick={() => setSearch('')}><X size={14} /></Button>}
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <Spinner animation="border" variant="info" />
          </div>
        ) : sequences.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <Hash size={48} className="mb-3 opacity-25" />
            <p>No sequences found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 d-none d-md-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0">Head Name</th>
                  <th className="border-0">Prefix</th>
                  <th className="border-0 text-center">Start</th>
                  <th className="border-0 text-center">Stop</th>
                  <th className="border-0 text-center">Increment</th>
                  <th className="border-0 text-center">Last value</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sequences.map((s) => {
                  const editing = editingId === s.HeadName;
                  return (
                    <tr key={s.HeadName} onDoubleClick={() => !editing && handleDoubleClick(s)}
                        style={{ cursor: editing ? 'default' : 'pointer' }}
                        className={editing ? 'table-info bg-opacity-25' : ''}
                        title={!editing ? 'Double-click to edit' : ''}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                            <Hash size={16} className="text-info" />
                          </div>
                          <span className="fw-semibold">{s.HeadName}</span>
                        </div>
                      </td>
                      <td>
                        {editing
                          ? <Form.Control size="sm" style={{ width: 120 }} placeholder="Prefix" value={editForm.prefix} onChange={e => setEditForm(f => ({ ...f, prefix: e.target.value.toUpperCase() }))} autoFocus />
                          : <code className="bg-light px-2 py-1 rounded small fw-bold text-dark">{s.Prefix}</code>}
                      </td>
                      <td className="text-center">
                         {editing
                          ? <Form.Control size="sm" type="number" style={{ width: 80, margin: '0 auto' }} value={editForm.startValue} onChange={e => setEditForm(f => ({ ...f, startValue: parseInt(e.target.value)||0 }))} />
                          : s.StartValue}
                      </td>
                      <td className="text-center">
                         {editing
                           ? <Form.Control size="sm" type="number" style={{ width: 100, margin: '0 auto' }} value={editForm.stopValue} onChange={e => setEditForm(f => ({ ...f, stopValue: parseInt(e.target.value)||0 }))} />
                           : s.StopValue}
                      </td>
                      <td className="text-center">
                         {editing
                           ? <Form.Control size="sm" type="number" style={{ width: 80, margin: '0 auto' }} value={editForm.incrementValue} onChange={e => setEditForm(f => ({ ...f, incrementValue: parseInt(e.target.value)||0 }))} />
                           : s.IncrementValue}
                      </td>
                      <td className="text-center">
                         {editing
                           ? <Form.Control size="sm" type="number" style={{ width: 80, margin: '0 auto' }} value={editForm.lastValue} onChange={e => setEditForm(f => ({ ...f, lastValue: parseInt(e.target.value)||0 }))} />
                           : <Badge bg="secondary" className="bg-opacity-10 text-secondary">{s.LastValue}</Badge>}
                      </td>
                      <td className="text-end">
                        {editing ? (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="info" onClick={() => saveEdit(s.HeadName)} disabled={savingId === s.HeadName} className="rounded-circle p-1 text-white" style={{ width: 28, height: 28 }}>
                              {savingId === s.HeadName ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
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
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDelete(s.HeadName)}>
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
            
            {/* Mobile View Omitted for Brevity but using similar logic */}
            <div className="d-block d-md-none">
              {sequences.map(s => (
                 <div key={s.HeadName} className="p-3 border-bottom" onDoubleClick={() => !editingId && handleDoubleClick(s)}>
                    <div className="fw-bold mb-1">{s.HeadName}</div>
                    <div className="small text-muted">Prefix: <code>{s.Prefix}</code></div>
                    <div className="small text-muted mb-2">Range: {s.StartValue} to {s.StopValue} (Inc: {s.IncrementValue}) - Last: {s.LastValue}</div>
                    <div className="d-flex gap-2 mt-2">
                         <Button size="sm" variant="light" className="flex-fill" onClick={() => handleDoubleClick(s)}><Edit size={14} className="me-1" />Edit</Button>
                         <Button size="sm" variant="light" className="flex-fill text-danger" onClick={() => handleDelete(s.HeadName)}><Trash2 size={14} className="me-1" />Delete</Button>
                    </div>
                 </div>
              ))}
            </div>
            
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add New Sequence</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Row className="g-3">
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small">Head Name <span className="text-danger">*</span></Form.Label>
                <Form.Control placeholder="e.g. CUSTOMER" value={addForm.headName} onChange={e => setAddForm(f => ({ ...f, headName: e.target.value.toUpperCase() }))} autoFocus />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small">Prefix <span className="text-danger">*</span></Form.Label>
                <Form.Control placeholder="e.g. CUST" value={addForm.prefix} onChange={e => setAddForm(f => ({ ...f, prefix: e.target.value.toUpperCase() }))} />
              </Form.Group>
            </Col>
            <Col xs={6} sm={3}>
               <Form.Group>
                  <Form.Label className="fw-medium small">Start Value</Form.Label>
                  <Form.Control type="number" value={addForm.startValue} onChange={e => setAddForm(f => ({ ...f, startValue: parseInt(e.target.value)||0 }))} />
               </Form.Group>
            </Col>
            <Col xs={6} sm={3}>
               <Form.Group>
                  <Form.Label className="fw-medium small">Stop Value</Form.Label>
                  <Form.Control type="number" value={addForm.stopValue} onChange={e => setAddForm(f => ({ ...f, stopValue: parseInt(e.target.value)||0 }))} />
               </Form.Group>
            </Col>
            <Col xs={6} sm={3}>
               <Form.Group>
                  <Form.Label className="fw-medium small">Increment</Form.Label>
                  <Form.Control type="number" value={addForm.incrementValue} onChange={e => setAddForm(f => ({ ...f, incrementValue: parseInt(e.target.value)||0 }))} />
               </Form.Group>
            </Col>
            <Col xs={6} sm={3}>
               <Form.Group>
                  <Form.Label className="fw-medium small">Last Value</Form.Label>
                  <Form.Control type="number" value={addForm.lastValue} onChange={e => setAddForm(f => ({ ...f, lastValue: parseInt(e.target.value)||0 }))} />
               </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="info" className="rounded-pill px-4 text-white" onClick={handleAdd} disabled={addSaving}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : 'Save Sequence'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SequenceMasterPage;
