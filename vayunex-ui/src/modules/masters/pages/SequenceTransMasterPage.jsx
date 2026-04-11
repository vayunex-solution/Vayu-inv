// src/modules/masters/pages/SequenceTransMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, RefreshCw, Layers } from 'lucide-react';
import { apiClient } from '../../../lib';

const BASE = '/api/v1/inventory/sequence-trans';

const SequenceTransMasterPage = () => {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null); // composite key as "HeadName|FinancialYear"
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    headName: '',
    financialYear: '',
    prefix: '',
    suffix: '',
    delimiter: '/',
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
      FinancialYear: item.FinancialYear ?? item.financialYear ?? '',
      Prefix: item.Prefix ?? item.prefix ?? '',
      Suffix: item.Suffix ?? item.suffix ?? '',
      Delimiter: item.delimiter ?? item.Delimiter ?? '',
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
          seq.FinancialYear.toLowerCase().includes(s) ||
          seq.Prefix.toLowerCase().includes(s)
        );
      }
      setSequences(data);
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Failed to load transaction sequences', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  const handleDoubleClick = (seq) => {
    const key = `${seq.HeadName}|${seq.FinancialYear}`;
    setEditingId(key);
    setEditForm({
      headName: seq.HeadName,
      financialYear: seq.FinancialYear,
      prefix: seq.Prefix,
      suffix: seq.Suffix,
      delimiter: seq.Delimiter,
      startValue: seq.StartValue,
      stopValue: seq.StopValue,
      incrementValue: seq.IncrementValue,
      lastValue: seq.LastValue
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (headName, financialYear) => {
    const key = `${headName}|${financialYear}`;
    setSavingId(key);
    try {
      // Optimistic update
      setSequences(prev => prev.map(s => 
        (s.HeadName === headName && s.FinancialYear === financialYear)
          ? { ...s, Prefix: editForm.prefix, Suffix: editForm.suffix, Delimiter: editForm.delimiter, StartValue: editForm.startValue, StopValue: editForm.stopValue, IncrementValue: editForm.incrementValue, LastValue: editForm.lastValue }
          : s
      ));
      await apiClient.put(`${BASE}/${encodeURIComponent(headName)}/${encodeURIComponent(financialYear)}`, editForm);
      showAlert('Trans Sequence updated successfully');
    } catch (err) {
      fetchSequences(); // revert
      showAlert(err.response?.data?.message || err.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (headName, financialYear) => {
    if (!window.confirm(`Delete trans sequence for ${headName} (${financialYear})?`)) return;
    const prev = [...sequences];
    setSequences(sequences.filter(s => !(s.HeadName === headName && s.FinancialYear === financialYear)));
    try {
      await apiClient.delete(`${BASE}/${encodeURIComponent(headName)}/${encodeURIComponent(financialYear)}`);
      showAlert('Trans Sequence deleted');
    } catch (err) {
      setSequences(prev);
      showAlert(err.response?.data?.message || err.message || 'Delete failed', 'danger');
    }
  };

  const handleAdd = async () => {
    if (!addForm.headName.trim() || !addForm.financialYear.trim() || !addForm.prefix.trim()) {
      showAlert('Head Name, Financial Year, and Prefix are required', 'danger');
      return;
    }
    setAddSaving(true);
    try {
      await apiClient.post(BASE, addForm);
      setShowAddModal(false);
      setAddForm({ headName: '', financialYear: '', prefix: '', suffix: '', delimiter: '/', startValue: 1, stopValue: 99999, incrementValue: 1, lastValue: 0 });
      fetchSequences();
      showAlert('Trans Sequence added successfully');
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
          <h4 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            <Layers size={22} className="me-2 text-success d-inline-block align-text-top" />
            Sequence Trans Master
          </h4>
          <p className="text-muted small mb-0">{sequences.length} Transaction Sequences Configured</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" className="rounded-pill" onClick={fetchSequences} title="Refresh" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </Button>
          <Button variant="success" className="d-flex align-items-center gap-2 rounded-pill shadow-sm text-white" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Trans SEQ
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
                  placeholder="Search by Head Name, Prefix or FY..."
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
            <Spinner animation="border" variant="success" />
          </div>
        ) : sequences.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <Layers size={48} className="mb-3 opacity-25" />
            <p>No transaction sequences found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 d-none d-md-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0">Head Name</th>
                  <th className="border-0">FY</th>
                  <th className="border-0">Prefix</th>
                  <th className="border-0">Suffix</th>
                  <th className="border-0 text-center">Delim</th>
                  <th className="border-0 text-center">Start</th>
                  <th className="border-0 text-center">Stop</th>
                  <th className="border-0 text-center">Inc</th>
                  <th className="border-0 text-center">Last</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sequences.map((s) => {
                  const editingKey = `${s.HeadName}|${s.FinancialYear}`;
                  const isEditing = editingId === editingKey;
                  return (
                    <tr key={editingKey} onDoubleClick={() => !isEditing && handleDoubleClick(s)}
                        style={{ cursor: isEditing ? 'default' : 'pointer' }}
                        className={isEditing ? 'table-success bg-opacity-25' : ''}
                        title={!isEditing ? 'Double-click to edit' : ''}>
                      <td><span className="fw-semibold">{s.HeadName}</span></td>
                      <td><Badge bg="secondary" className="bg-opacity-10 text-secondary">{s.FinancialYear}</Badge></td>
                      <td>
                        {isEditing
                          ? <Form.Control size="sm" style={{ width: 80 }} value={editForm.prefix} onChange={e => setEditForm(f => ({ ...f, prefix: e.target.value.toUpperCase() }))} autoFocus />
                          : <code className="bg-light px-2 py-1 rounded small text-dark fw-bold">{s.Prefix}</code>}
                      </td>
                      <td>
                        {isEditing
                          ? <Form.Control size="sm" style={{ width: 80 }} value={editForm.suffix} onChange={e => setEditForm(f => ({ ...f, suffix: e.target.value }))} />
                          : <span className="small">{s.Suffix}</span>}
                      </td>
                      <td className="text-center">
                        {isEditing
                          ? <Form.Control size="sm" style={{ width: 50, margin: '0 auto' }} value={editForm.delimiter} onChange={e => setEditForm(f => ({ ...f, delimiter: e.target.value }))} />
                          : <code className="text-secondary">{s.Delimiter}</code>}
                      </td>
                      <td className="text-center">
                         {isEditing
                          ? <Form.Control size="sm" type="number" style={{ width: 70, margin: '0 auto' }} value={editForm.startValue} onChange={e => setEditForm(f => ({ ...f, startValue: parseInt(e.target.value)||0 }))} />
                          : s.StartValue}
                      </td>
                      <td className="text-center">
                         {isEditing
                           ? <Form.Control size="sm" type="number" style={{ width: 90, margin: '0 auto' }} value={editForm.stopValue} onChange={e => setEditForm(f => ({ ...f, stopValue: parseInt(e.target.value)||0 }))} />
                           : s.StopValue}
                      </td>
                      <td className="text-center">
                         {isEditing
                           ? <Form.Control size="sm" type="number" style={{ width: 60, margin: '0 auto' }} value={editForm.incrementValue} onChange={e => setEditForm(f => ({ ...f, incrementValue: parseInt(e.target.value)||0 }))} />
                           : s.IncrementValue}
                      </td>
                      <td className="text-center">
                         {isEditing
                           ? <Form.Control size="sm" type="number" style={{ width: 70, margin: '0 auto' }} value={editForm.lastValue} onChange={e => setEditForm(f => ({ ...f, lastValue: parseInt(e.target.value)||0 }))} />
                           : <Badge bg="success" className="bg-opacity-10 text-success">{s.LastValue}</Badge>}
                      </td>
                      <td className="text-end">
                        {isEditing ? (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="success" onClick={() => saveEdit(s.HeadName, s.FinancialYear)} disabled={savingId === editingKey} className="rounded-circle p-1 text-white" style={{ width: 28, height: 28 }}>
                              {savingId === editingKey ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
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
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDelete(s.HeadName, s.FinancialYear)}>
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
            
            {/* Mobile View omitted for brevity */}
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add Trans Sequence</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Row className="g-3">
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small">Head Name <span className="text-danger">*</span></Form.Label>
                <Form.Control placeholder="e.g. INVOICE" value={addForm.headName} onChange={e => setAddForm(f => ({ ...f, headName: e.target.value.toUpperCase() }))} autoFocus />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small">Financial Year <span className="text-danger">*</span></Form.Label>
                <Form.Control placeholder="e.g. 2026-2027" value={addForm.financialYear} onChange={e => setAddForm(f => ({ ...f, financialYear: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="fw-medium small">Prefix <span className="text-danger">*</span></Form.Label>
                <Form.Control placeholder="e.g. INV" value={addForm.prefix} onChange={e => setAddForm(f => ({ ...f, prefix: e.target.value.toUpperCase() }))} />
              </Form.Group>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="fw-medium small">Suffix</Form.Label>
                <Form.Control value={addForm.suffix} onChange={e => setAddForm(f => ({ ...f, suffix: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="fw-medium small">Delimiter</Form.Label>
                <Form.Control value={addForm.delimiter} onChange={e => setAddForm(f => ({ ...f, delimiter: e.target.value }))} />
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
          <Button variant="success" className="rounded-pill px-4 text-white" onClick={handleAdd} disabled={addSaving}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : 'Save Trans Sequence'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SequenceTransMasterPage;
