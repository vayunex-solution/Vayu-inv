// src/modules/masters/pages/AccountGroupMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, Folder, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../lib';

const AccountGroupMasterPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ 
    GroupName: '', 
    ParentGroupId: 0, 
    Position: 0, 
    Belongsto: '', 
    GroupType: '', 
    BranchId: 1 
  });
  const [addSaving, setAddSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/inventory/accounts/groups');
      const data = res.data || res || [];
      const filtered = search
        ? data.filter(g =>
            (g.GroupName || '').toLowerCase().includes(search.toLowerCase()) ||
            (String(g.GroupCode || '')).toLowerCase().includes(search.toLowerCase())
          )
        : data;
      setGroups(filtered);
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Failed to load account groups', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  // ── Double-click to edit ──
  const handleDoubleClick = (group) => {
    setEditingId(group.GroupId);
    setEditForm({
      GroupName: group.GroupName || '',
      ParentGroupId: group.ParentGroupId || 0,
      Position: group.Position || 0,
      Belongsto: group.Belongsto || '',
      GroupType: group.GroupType || '',
      BranchId: group.BranchId || 1
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      // Optimistic update
      setGroups(prev => prev.map(g =>
        g.GroupId === id ? { ...g, ...editForm } : g
      ));
      await apiClient.put(`/api/v1/inventory/accounts/groups/${id}`, editForm);
      showAlert('Account Group updated successfully');
    } catch (err) {
      fetchGroups();
      showAlert(err.response?.data?.message || err.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Account Group?')) return;
    const prev = [...groups];
    setGroups(groups.filter(g => g.GroupId !== id));
    try {
      await apiClient.delete(`/api/v1/inventory/accounts/groups/${id}`);
      showAlert('Account Group deleted');
    } catch (err) {
      setGroups(prev);
      showAlert(err.response?.data?.message || err.message || 'Delete failed', 'danger');
    }
  };

  const handleAdd = async () => {
    if (!addForm.GroupName.trim()) {
      showAlert('Group Name is required', 'danger'); return;
    }
    setAddSaving(true);
    try {
      await apiClient.post('/api/v1/inventory/accounts/groups', addForm);
      setShowAddModal(false);
      setAddForm({ GroupName: '', ParentGroupId: 0, Position: 0, Belongsto: '', GroupType: '', BranchId: 1 });
      fetchGroups();
      showAlert('Account Group added successfully');
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Failed to add group', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

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
          <h4 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Account Groups Master
          </h4>
          <p className="text-muted small mb-0">{groups.length} groups configured</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" className="rounded-pill" onClick={fetchGroups} title="Refresh">
            <RefreshCw size={16} />
          </Button>
          <Button variant="primary" className="d-flex align-items-center gap-2 rounded-pill shadow-sm text-white" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Group
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
        <Card.Body className="py-3">
          <Row className="g-2">
            <Col xs={12} md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0"><Search size={16} className="text-muted" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search by group name or code..."
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

      {/* Table Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <Folder size={48} className="mb-3 opacity-25" />
            <p>No Account Groups found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">Code</th>
                  <th className="border-0">Group Name</th>
                  <th className="border-0">Belongs To</th>
                  <th className="border-0">Type</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g, idx) => {
                  const editing = editingId === g.GroupId;
                  return (
                    <tr key={g.GroupId} onDoubleClick={() => !editing && handleDoubleClick(g)}
                        style={{ cursor: editing ? 'default' : 'pointer' }}
                        className={editing ? 'table-primary bg-opacity-25' : ''}
                        title={!editing ? 'Double-click to edit' : ''}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        <code className="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded small fw-bold">
                          {g.GroupCode || '—'}
                        </code>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                            <Folder size={16} className="text-primary" />
                          </div>
                          {editing
                            ? <Form.Control size="sm" value={editForm.GroupName} onChange={e => setEditForm(f => ({ ...f, GroupName: e.target.value }))} autoFocus />
                            : <span className="fw-semibold">{g.GroupName}</span>}
                        </div>
                      </td>
                      <td>
                        {editing
                          ? <Form.Control size="sm" style={{ width: 120 }} placeholder="Belongs To" value={editForm.Belongsto} onChange={e => setEditForm(f => ({ ...f, Belongsto: e.target.value }))} />
                          : <span>{g.Belongsto || '—'}</span>}
                      </td>
                      <td>
                        {editing
                          ? <Form.Control size="sm" style={{ width: 120 }} placeholder="Group Type" value={editForm.GroupType} onChange={e => setEditForm(f => ({ ...f, GroupType: e.target.value }))} />
                          : <span className="badge bg-secondary bg-opacity-10 text-secondary fw-normal px-2 py-1">{g.GroupType || '—'}</span>}
                      </td>
                      <td className="text-end">
                        {editing ? (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="primary" onClick={() => saveEdit(g.GroupId)} disabled={savingId === g.GroupId} className="rounded-circle p-1 text-white" style={{ width: 28, height: 28 }}>
                              {savingId === g.GroupId ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
                            </Button>
                            <Button size="sm" variant="danger" onClick={cancelEdit} className="rounded-circle p-1" style={{ width: 28, height: 28 }}>
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDoubleClick(g)}>
                              <Edit size={14} className="text-muted" />
                            </Button>
                            <Button size="sm" variant="light" className="rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => handleDelete(g.GroupId)}>
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

      {/* Add Group Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add Account Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Group Name <span className="text-danger">*</span></Form.Label>
              <Form.Control placeholder="e.g. Current Assets" value={addForm.GroupName} onChange={e => setAddForm(f => ({ ...f, GroupName: e.target.value }))} />
            </Form.Group>
            
            <Row className="g-2">
              <Col xs={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Belongs To</Form.Label>
                  <Form.Control placeholder="e.g. Assets" value={addForm.Belongsto} onChange={e => setAddForm(f => ({ ...f, Belongsto: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Group Type</Form.Label>
                  <Form.Control placeholder="e.g. Primary" value={addForm.GroupType} onChange={e => setAddForm(f => ({ ...f, GroupType: e.target.value }))} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Parent Group</Form.Label>
              <Form.Select 
                value={addForm.ParentGroupId} 
                onChange={(e) => {
                  const parentId = parseInt(e.target.value) || 0;
                  let newBelongsto = addForm.Belongsto;
                  if (parentId !== 0) {
                    const parentGroup = groups.find(g => g.GroupId === parentId);
                    if (parentGroup && parentGroup.Belongsto) {
                      newBelongsto = parentGroup.Belongsto;
                    }
                  }
                  setAddForm(f => ({ ...f, ParentGroupId: parentId, Belongsto: newBelongsto }));
                }}
              >
                <option value={0}>Root Group (0)</option>
                {groups.map(g => (
                  <option key={g.GroupId} value={g.GroupId}>{g.GroupName}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" className="rounded-pill px-4 text-white" onClick={handleAdd} disabled={addSaving}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : 'Add Group'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AccountGroupMasterPage;
