// src/modules/masters/pages/AccountHeadMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, FileText, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../lib';

const AccountHeadMasterPage = () => {
  const [heads, setHeads] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ 
    accounthead: '', 
    groupid: '', 
    branchid: 1, 
    yearopeningbalance: 0 
  });
  const [addSaving, setAddSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // Load groups for dropdown filter and creation
  useEffect(() => {
    apiClient.get('/api/v1/inventory/accounts/groups/dropdown')
      .then(res => setGroups(res.data || res || []))
      .catch(() => {});
  }, []);

  const fetchHeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/inventory/accounts/heads');
      let rawData = res.data || res || [];
      
      // Remap lowercase keys to PascalCase to fix binding bugs with UI expecting PascalCase
      const data = rawData.map(item => ({
        ...item,
        AccountId: item.accountid || item.AccountId,
        AccountHead: item.accounthead || item.AccountHead,
        GroupId: item.groupid || item.GroupId,
        YearOpeningBalance: item.yearopeningbalance || item.YearOpeningBalance || 0,
        BranchId: item.branchid || item.BranchId || 1
      }));

      let filtered = data;
      if (search) {
        filtered = filtered.filter(h =>
          (h.AccountHead || '').toLowerCase().includes(search.toLowerCase())
        );
      }
      if (selectedGroupId) {
        filtered = filtered.filter(h => String(h.GroupId) === String(selectedGroupId));
      }
      
      setHeads(filtered);
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Failed to load account heads', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search, selectedGroupId]);

  useEffect(() => { fetchHeads(); }, [fetchHeads]);

  // ── Double-click to edit ──
  const handleDoubleClick = (head) => {
    setEditingId(head.AccountId);
    setEditForm({
      accounthead: head.AccountHead || '',
      groupid: head.GroupId || '',
      yearopeningbalance: head.YearOpeningBalance || 0,
      branchid: head.BranchId || 1
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      // Optimistic update
      setHeads(prev => prev.map(h =>
        h.AccountId === id ? { ...h, AccountHead: editForm.accounthead, GroupId: editForm.groupid, YearOpeningBalance: editForm.yearopeningbalance } : h
      ));
      await apiClient.put(`/api/v1/inventory/accounts/heads/${id}`, editForm);
      showAlert('Account Head updated successfully');
    } catch (err) {
      fetchHeads();
      showAlert(err.response?.data?.message || err.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Account Head?')) return;
    const prev = [...heads];
    setHeads(heads.filter(h => h.AccountId !== id));
    try {
      await apiClient.delete(`/api/v1/inventory/accounts/heads/${id}`);
      showAlert('Account Head deleted');
    } catch (err) {
      setHeads(prev);
      showAlert(err.response?.data?.message || err.message || 'Delete failed', 'danger');
    }
  };

  const handleAdd = async () => {
    if (!addForm.groupid || !addForm.accounthead.trim()) {
      showAlert('Group and Account Head Name are required', 'danger'); return;
    }
    setAddSaving(true);
    try {
      await apiClient.post('/api/v1/inventory/accounts/heads', addForm);
      setShowAddModal(false);
      setAddForm({ accounthead: '', groupid: '', branchid: 1, yearopeningbalance: 0 });
      fetchHeads();
      showAlert('Account Head added successfully');
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Failed to add head', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

  const getGroupName = (id) => groups.find(g => String(g.GroupId) === String(id))?.GroupName || `Group #${id}`;

  return (
    <div className="container-fluid p-0">
      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible position-fixed top-0 end-0 m-3 shadow`} style={{ zIndex: 9999 }}>
          {alert.msg}
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Account Heads Master
          </h4>
          <p className="text-muted small mb-0">{heads.length} account heads configured</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" className="rounded-pill" onClick={fetchHeads} title="Refresh">
            <RefreshCw size={16} />
          </Button>
          <Button variant="success" className="d-flex align-items-center gap-2 rounded-pill shadow-sm text-white" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Head
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
        <Card.Body className="py-3">
          <Row className="g-2">
            <Col xs={12} md={5}>
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0"><Search size={16} className="text-muted" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search by account head name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent border-start-0 shadow-none"
                />
                {search && <Button variant="light" onClick={() => setSearch('')}><X size={14} /></Button>}
              </InputGroup>
            </Col>
            <Col xs={12} md={4}>
              <Form.Select value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} className="shadow-none">
                <option value="">All Groups</option>
                {groups.map(g => (
                  <option key={g.GroupId} value={g.GroupId}>{g.GroupName}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} md={3}>
              <Button variant="outline-secondary" className="w-100 rounded-pill" onClick={() => { setSearch(''); setSelectedGroupId(''); }}>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <Spinner animation="border" variant="success" />
          </div>
        ) : heads.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <FileText size={48} className="mb-3 opacity-25" />
            <p>No Account Heads found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">Account Head</th>
                  <th className="border-0">Account Group</th>
                  <th className="border-0">Opening Balance</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {heads.map((h, idx) => {
                  const editing = editingId === h.AccountId;
                  return (
                    <tr key={h.AccountId} onDoubleClick={() => !editing && handleDoubleClick(h)}
                        style={{ cursor: editing ? 'default' : 'pointer' }}
                        className={editing ? 'table-success bg-opacity-25' : ''}
                        title={!editing ? 'Double-click to edit' : ''}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                            <FileText size={16} className="text-success" />
                          </div>
                          {editing
                            ? <Form.Control size="sm" value={editForm.accounthead} onChange={e => setEditForm(f => ({ ...f, accounthead: e.target.value }))} autoFocus />
                            : <span className="fw-semibold">{h.AccountHead}</span>}
                        </div>
                      </td>
                      <td>
                        {editing
                          ? <Form.Select size="sm" style={{ width: 200 }} value={editForm.groupid} onChange={e => setEditForm(f => ({ ...f, groupid: e.target.value }))}>
                              <option value="">Select Group...</option>
                              {groups.map(g => <option key={g.GroupId} value={g.GroupId}>{g.GroupName}</option>)}
                            </Form.Select>
                          : <span className="badge bg-secondary bg-opacity-10 text-secondary fw-normal rounded-pill px-3">
                              {getGroupName(h.GroupId)}
                            </span>}
                      </td>
                      <td>
                        {editing
                          ? <Form.Control type="number" size="sm" style={{ width: 120 }} value={editForm.yearopeningbalance} onChange={e => setEditForm(f => ({ ...f, yearopeningbalance: parseFloat(e.target.value)||0 }))} />
                          : <code className="bg-success bg-opacity-10 text-success px-2 py-1 rounded small fw-bold">₹ {h.YearOpeningBalance || 0}</code>}
                      </td>
                      <td className="text-end">
                        {editing ? (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="success" onClick={() => saveEdit(h.AccountId)} disabled={savingId === h.AccountId} className="rounded-circle p-1 text-white" style={{ width: 28, height: 28 }}>
                              {savingId === h.AccountId ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
                            </Button>
                            <Button size="sm" variant="danger" onClick={cancelEdit} className="rounded-circle p-1" style={{ width: 28, height: 28 }}>
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDoubleClick(h)}>
                              <Edit size={14} className="text-muted" />
                            </Button>
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDelete(h.AccountId)}>
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
          </div>
        )}
      </Card>
      <div className="text-center mt-3"><small className="text-muted">✨ Double-click any row to quick edit</small></div>

      {/* Add Head Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add Account Head</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Account Group <span className="text-danger">*</span></Form.Label>
              <Form.Select value={addForm.groupid} onChange={e => setAddForm(f => ({ ...f, groupid: e.target.value }))}>
                <option value="">Select Group</option>
                {groups.map(g => (
                  <option key={g.GroupId} value={g.GroupId}>{g.GroupName}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Account Head Name <span className="text-danger">*</span></Form.Label>
              <Form.Control placeholder="e.g. Sales Account" value={addForm.accounthead} onChange={e => setAddForm(f => ({ ...f, accounthead: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Year Opening Balance</Form.Label>
              <Form.Control type="number" placeholder="0.00" value={addForm.yearopeningbalance} onChange={e => setAddForm(f => ({ ...f, yearopeningbalance: parseFloat(e.target.value)||0 }))} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="success" className="rounded-pill px-4 text-white" onClick={handleAdd} disabled={addSaving}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : 'Add Head'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AccountHeadMasterPage;
