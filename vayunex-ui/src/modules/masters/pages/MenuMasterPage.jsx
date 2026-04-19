// src/modules/masters/pages/MenuMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, Menu, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../lib';

const normList = (data) => {
  return data.map(m => ({
    MenuId: m.MenuId ?? m.id ?? m.Id ?? m.menu_id ?? m.MenuID ?? 0,
    MenuKey: m.MenuKey ?? m.menu_key ?? '',
    Title: m.Title ?? m.title ?? '',
    Icon: m.Icon ?? m.icon ?? '',
    Url: m.Url ?? m.url ?? '',
    ParentId: m.ParentId ?? m.parent_id ?? 0,
    SortOrder: m.SortOrder ?? m.sort_order ?? 0,
    IsActive: m.IsActive ?? m.is_active ?? m.IsStatus ?? true,
  }));
};

const MenuMasterPage = () => {
  const [menus, setMenus] = useState([]);
  const [parentMenus, setParentMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    menu_key: '', title: '', icon: '', url: '', parent_id: 0, sort_order: 0, is_active: true
  });
  const [addSaving, setAddSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchDropdowns = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/v1/admin/menus/dropdown').catch(() => ({ data: [] }));
      setParentMenus(Array.isArray(res.data) ? res.data : (res || []));
    } catch {
      // ignore
    }
  }, []);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/admin/menus');
      const data = normList(Array.isArray(res.data) ? res.data : (res || []));
      
      const filtered = search
        ? data.filter(m =>
            m.Title.toLowerCase().includes(search.toLowerCase()) ||
            m.MenuKey.toLowerCase().includes(search.toLowerCase())
          )
        : data;
      
      // Sort parent menus for local selection if dropdown fails
      if (parentMenus.length === 0) {
        setParentMenus(data.filter(m => m.ParentId === 0));
      }
        
      setMenus(filtered);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to load menus', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search, parentMenus.length]);

  useEffect(() => { 
    fetchDropdowns().then(() => fetchMenus()); 
  }, [fetchDropdowns, fetchMenus]);

  // ── Double-click to edit ──
  const handleDoubleClick = (item) => {
    setEditingId(item.MenuId);
    setEditForm({
      menu_key: item.MenuKey,
      title: item.Title,
      icon: item.Icon || '',
      url: item.Url || '',
      parent_id: item.ParentId || 0,
      sort_order: item.SortOrder || 0,
      is_active: item.IsActive === 'Y' || item.IsActive === 1 || item.IsActive === true,
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      // Prepare payload exactly mapping to swagger fields
      const payload = {
        ...editForm,
        parent_id: parseInt(editForm.parent_id, 10),
        sort_order: parseInt(editForm.sort_order, 10),
        is_active: editForm.is_active
      };
      
      await apiClient.put(`/api/v1/admin/menus/${id}`, payload);
      showAlert('Menu updated successfully');
      fetchMenus();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await apiClient.delete(`/api/v1/admin/menus/${id}`);
      showAlert('Menu deleted');
      fetchMenus();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const handleAdd = async () => {
    if (!addForm.menu_key.trim() || !addForm.title.trim()) {
      showAlert('Menu Key and Title are required', 'danger'); 
      return;
    }
    setAddSaving(true);
    try {
      const payload = {
        ...addForm,
        parent_id: parseInt(addForm.parent_id, 10),
        sort_order: parseInt(addForm.sort_order, 10),
        is_active: addForm.is_active
      };
      await apiClient.post('/api/v1/admin/menus', payload);
      setShowAddModal(false);
      setAddForm({ menu_key: '', title: '', icon: '', url: '', parent_id: 0, sort_order: 0, is_active: true });
      fetchMenus();
      fetchDropdowns();
      showAlert('Menu added successfully');
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Failed to add menu', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

  const getParentTitle = (parentId) => {
    if (parentId === 0 || !parentId) return "None (Root)";
    const p = parentMenus.find(p => (p.MenuId || p.id || p.MenuID) === parentId);
    return p ? (p.Title || p.title) : `ID #${parentId}`;
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
          <h4 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Menu Master
          </h4>
          <p className="text-muted small mb-0">Manage application menus and navigation</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" className="rounded-pill border" onClick={() => { fetchDropdowns(); fetchMenus(); }} title="Refresh">
            <RefreshCw size={16} /> Refresh
          </Button>
          <Button variant="success" className="d-flex align-items-center gap-2 rounded-pill shadow-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Menu
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
                  placeholder="Search menus by Title or Key..."
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
            <Spinner animation="border" variant="success" />
          </div>
        ) : menus.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <Menu size={48} className="mb-3 opacity-25" />
            <p>No menus found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap">
              <thead className="table-light">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">Title</th>
                  <th className="border-0">Menu Key</th>
                  <th className="border-0">URL</th>
                  <th className="border-0">Parent</th>
                  <th className="border-0">Sort Order</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((m, idx) => {
                  const editing = editingId === m.MenuId;
                  const isActiveVal = m.IsActive === 'Y' || m.IsActive === 1 || m.IsActive === true;
                  
                  return (
                    <tr key={m.MenuId} onDoubleClick={() => !editing && handleDoubleClick(m)}
                        style={{ cursor: editing ? 'default' : 'pointer' }}
                        className={editing ? 'table-success bg-opacity-25' : ''}
                        title={!editing ? 'Double-click to edit' : ''}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                            <Menu size={16} className="text-success" />
                          </div>
                          {editing
                            ? <Form.Control size="sm" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                            : <span className="fw-semibold text-dark">{m.Title}</span>}
                        </div>
                      </td>
                      <td>
                        {editing
                          ? <Form.Control size="sm" value={editForm.menu_key} onChange={e => setEditForm(f => ({ ...f, menu_key: e.target.value }))} />
                          : <code className="text-primary">{m.MenuKey}</code>}
                      </td>
                      <td>
                        {editing
                          ? <Form.Control size="sm" placeholder="/path" value={editForm.url} onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))} />
                          : m.Url ? <span className="text-muted small">{m.Url}</span> : <span className="text-muted opacity-50">—</span>}
                      </td>
                      <td>
                        {editing
                          ? (
                            <Form.Select size="sm" value={editForm.parent_id} onChange={e => setEditForm(f => ({ ...f, parent_id: e.target.value }))}>
                              <option value="0">None (Root)</option>
                              {parentMenus.map(p => (
                                <option key={p.MenuId || p.id || p.MenuID} value={p.MenuId || p.id || p.MenuID}>{p.Title || p.title}</option>
                              ))}
                            </Form.Select>
                          )
                          : <span className="badge bg-light text-secondary border">{getParentTitle(m.ParentId)}</span>}
                      </td>
                      <td>
                        {editing
                          ? <Form.Control type="number" size="sm" style={{ width: 70 }} value={editForm.sort_order} onChange={e => setEditForm(f => ({ ...f, sort_order: e.target.value }))} />
                          : <span className="fw-medium">{m.SortOrder}</span>}
                      </td>
                      <td className="text-center">
                        {editing
                          ? <Form.Check type="switch" checked={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} />
                          : <Badge bg={isActiveVal ? 'success' : 'secondary'} className="rounded-pill px-3 fw-normal">{isActiveVal ? 'Active' : 'Inactive'}</Badge>}
                      </td>
                      <td className="text-end">
                        {editing ? (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="success" onClick={() => saveEdit(m.MenuId)} disabled={savingId === m.MenuId} className="rounded-circle p-1 text-white shadow-sm" style={{ width: 28, height: 28 }}>
                              {savingId === m.MenuId ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
                            </Button>
                            <Button size="sm" variant="danger" onClick={cancelEdit} className="rounded-circle p-1 shadow-sm" style={{ width: 28, height: 28 }}>
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-1">
                            <Button size="sm" variant="light" className="rounded-circle p-1 border-0" style={{ width: 28, height: 28 }} onClick={() => handleDoubleClick(m)}>
                              <Edit size={14} className="text-muted" />
                            </Button>
                            <Button size="sm" variant="light" className="rounded-circle p-1 border-0" style={{ width: 28, height: 28 }} onClick={() => handleDelete(m.MenuId)}>
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

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add New Menu</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Parent Menu</Form.Label>
                  <Form.Select value={addForm.parent_id} onChange={e => setAddForm(f => ({ ...f, parent_id: e.target.value }))} className="shadow-none rounded-3">
                    <option value={0}>None (Root Menu)</option>
                    {parentMenus.map(p => (
                      <option key={p.MenuId || p.id || p.MenuID} value={p.MenuId || p.id || p.MenuID}>{p.Title || p.title}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Title (Display Name) <span className="text-danger">*</span></Form.Label>
                  <Form.Control required placeholder="e.g. Dashboard" value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} className="shadow-none rounded-3" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Menu Key <span className="text-danger">*</span></Form.Label>
                  <Form.Control required placeholder="e.g. DASHBOARD" value={addForm.menu_key} onChange={e => setAddForm(f => ({ ...f, menu_key: e.target.value.toUpperCase() }))} className="shadow-none rounded-3 text-uppercase" />
                  <Form.Text className="text-muted" style={{fontSize: '0.7em'}}>Must match UI component mapping key</Form.Text>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">URL / Route path</Form.Label>
                  <Form.Control placeholder="e.g. /dashboard" value={addForm.url} onChange={e => setAddForm(f => ({ ...f, url: e.target.value }))} className="shadow-none rounded-3" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Lucide Icon Name</Form.Label>
                  <Form.Control placeholder="e.g. LayoutDashboard" value={addForm.icon} onChange={e => setAddForm(f => ({ ...f, icon: e.target.value }))} className="shadow-none rounded-3" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Sort Order</Form.Label>
                  <Form.Control type="number" min="0" value={addForm.sort_order} onChange={e => setAddForm(f => ({ ...f, sort_order: e.target.value }))} className="shadow-none rounded-3" />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mt-2">
                  <Form.Check type="switch" label={<span className="fw-medium text-dark ms-1">Menu Active Status</span>} checked={addForm.is_active} onChange={e => setAddForm(f => ({ ...f, is_active: e.target.checked }))} className="shadow-none" />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" className="rounded-pill px-4 border" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="success" type="submit" className="rounded-pill px-4" disabled={addSaving}>
              {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : 'Save Menu'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuMasterPage;
