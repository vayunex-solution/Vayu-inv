// src/modules/masters/pages/MenuMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal, Nav } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, Menu, RefreshCw, Info, ChevronRight, ChevronDown, FolderOpen, Folder, FileText, List, GitBranch } from 'lucide-react';
import { apiClient } from '../../../lib';

// Safely extract the ID from any parent/dropdown object
const pid = (obj) => obj?.MenuId ?? obj?.Id ?? obj?.id ?? obj?.menu_id ?? obj?.MenuID ?? 0;
const ptitle = (obj) => obj?.Title ?? obj?.title ?? '';

const normList = (data) => {
  return data.map(m => ({
    MenuId: m.MenuId ?? m.Id ?? m.id ?? m.menu_id ?? m.MenuID ?? 0,
    MenuKey: m.MenuKey ?? m.menu_key ?? '',
    Title: m.Title ?? m.title ?? '',
    Icon: m.Icon ?? m.icon ?? '',
    Url: m.Url ?? m.url ?? '',
    ParentId: m.ParentId ?? m.parent_id ?? 0,
    SortOrder: m.SortOrder ?? m.sort_order ?? 0,
    IsActive: m.IsActive ?? m.is_active ?? m.IsStatus ?? true,
  }));
};

// ── Example guide data ──
const EXAMPLES = [
  {
    label: 'Root Menu (Group)',
    desc: 'Top-level group that holds child menus',
    fields: { title: 'Inventory-Setup', menu_key: 'INVENTORY_SETUP', icon: 'ClipboardList', url: '', parent: 'None (Root)', sort_order: 2 }
  },
  {
    label: 'Child Menu (Page)',
    desc: 'Actual page under a parent group',
    fields: { title: 'Items Master', menu_key: 'ITEMS_MASTER', icon: 'Box', url: '/inventory/items', parent: 'Inventory-Setup', sort_order: 1 }
  },
  {
    label: 'Admin Sub-menu',
    desc: 'Admin section child',
    fields: { title: 'Menu', menu_key: 'MENU_MASTER', icon: 'Menu', url: '/admin/Menu', parent: 'Admin', sort_order: 1 }
  }
];

// ── Tree Node Component ──
const TreeNode = ({ node, level = 0, expandedNodes, toggleNode }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id || node.db_id);
  const indent = level * 24;

  return (
    <>
      <div
        className="d-flex align-items-center py-2 px-3 border-bottom tree-row"
        style={{
          paddingLeft: indent + 12,
          cursor: hasChildren ? 'pointer' : 'default',
          background: level === 0 ? 'rgba(16,185,129,0.03)' : 'transparent',
          transition: 'background 0.15s ease',
        }}
        onClick={() => hasChildren && toggleNode(node.id || node.db_id)}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.06)'}
        onMouseLeave={e => e.currentTarget.style.background = level === 0 ? 'rgba(16,185,129,0.03)' : 'transparent'}
      >
        {/* Indent guide lines */}
        {level > 0 && (
          <div style={{ position: 'absolute', left: indent - 4, top: 0, bottom: 0, width: 1, background: '#e5e7eb' }} />
        )}

        {/* Expand/collapse or leaf indicator */}
        <div style={{ width: 24, minWidth: 24, textAlign: 'center' }}>
          {hasChildren ? (
            isExpanded
              ? <ChevronDown size={16} className="text-success" />
              : <ChevronRight size={16} className="text-muted" />
          ) : (
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d1d5db', margin: '0 auto' }} />
          )}
        </div>

        {/* Folder / File icon */}
        <div className={`rounded d-flex align-items-center justify-content-center me-2 ${hasChildren ? 'bg-warning bg-opacity-10' : 'bg-success bg-opacity-10'}`}
             style={{ width: 28, height: 28, minWidth: 28 }}>
          {hasChildren
            ? (isExpanded ? <FolderOpen size={14} className="text-warning" /> : <Folder size={14} className="text-warning" />)
            : <FileText size={14} className="text-success" />}
        </div>

        {/* Title */}
        <span className={`fw-${level === 0 ? 'bold' : 'medium'} text-dark me-2`} style={{fontSize: level === 0 ? '0.9em' : '0.85em'}}>
          {node.title}
        </span>

        {/* Menu key badge */}
        <code className="text-primary small me-2" style={{fontSize:'0.72em'}}>{node.id}</code>

        {/* URL if present */}
        {node.url && node.url !== 'null' && (
          <span className="text-muted small me-2" style={{fontSize:'0.72em'}}>
            → {node.url}
          </span>
        )}

        {/* Children count */}
        {hasChildren && (
          <Badge bg="light" className="text-muted border ms-auto" style={{fontSize:'0.7em'}}>
            {node.children.length} {node.children.length === 1 ? 'child' : 'children'}
          </Badge>
        )}
      </div>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div style={{ position: 'relative' }}>
          {node.children.map((child, i) => (
            <TreeNode
              key={child.db_id || child.id || i}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />
          ))}
        </div>
      )}
    </>
  );
};

const MenuMasterPage = () => {
  const [menus, setMenus] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [parentMenus, setParentMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState('list'); // 'list' | 'tree'
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    menu_key: '', title: '', icon: '', url: '', parent_id: 0, sort_order: 0, is_active: true
  });
  const [addSaving, setAddSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const showAlertMsg = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const expandAll = (nodes) => {
    const ids = new Set();
    const collect = (list) => {
      list.forEach(n => {
        if (n.children && n.children.length > 0) {
          ids.add(n.id || n.db_id);
          collect(n.children);
        }
      });
    };
    collect(nodes);
    setExpandedNodes(ids);
  };

  const collapseAll = () => setExpandedNodes(new Set());

  const fetchDropdowns = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/v1/admin/menus/dropdown').catch(() => ({ data: [] }));
      const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setParentMenus(list);
    } catch {
      // ignore
    }
  }, []);

  const fetchTree = useCallback(async () => {
    setTreeLoading(true);
    try {
      const res = await apiClient.get('/api/v1/admin/menus/tree');
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setTreeData(data);
      // Auto-expand all on first load
      if (expandedNodes.size === 0 && data.length > 0) {
        expandAll(data);
      }
    } catch (err) {
      console.error('Failed to load tree:', err);
    } finally {
      setTreeLoading(false);
    }
  }, []);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/admin/menus');
      const raw = res?.data ?? res ?? [];
      const data = normList(Array.isArray(raw) ? raw : []);
      
      const filtered = search
        ? data.filter(m =>
            m.Title.toLowerCase().includes(search.toLowerCase()) ||
            m.MenuKey.toLowerCase().includes(search.toLowerCase())
          )
        : data;
        
      setMenus(filtered);
    } catch (err) {
      showAlertMsg(err.response?.data?.message || 'Failed to load menus', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { 
    fetchDropdowns().then(() => {
      fetchMenus();
      fetchTree();
    }); 
  }, [fetchDropdowns, fetchMenus, fetchTree]);

  // ── Double-click to edit ──
  const handleDoubleClick = (item) => {
    setEditingId(item.MenuId);
    setEditForm({
      menu_key: item.MenuKey,
      title: item.Title,
      icon: item.Icon || '',
      url: item.Url || '',
      parent_id: String(item.ParentId ?? 0),
      sort_order: item.SortOrder || 0,
      is_active: item.IsActive === 'Y' || item.IsActive === 1 || item.IsActive === true,
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      const payload = {
        menu_key: editForm.menu_key,
        title: editForm.title,
        icon: editForm.icon,
        url: editForm.url,
        parent_id: parseInt(editForm.parent_id, 10) || 0,
        sort_order: parseInt(editForm.sort_order, 10) || 0,
        is_active: editForm.is_active
      };
      
      await apiClient.put(`/api/v1/admin/menus/${id}`, payload);
      showAlertMsg('Menu updated successfully');
      await fetchMenus();
      await fetchTree();
    } catch (err) {
      showAlertMsg(err.response?.data?.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await apiClient.delete(`/api/v1/admin/menus/${id}`);
      showAlertMsg('Menu deleted');
      fetchMenus();
      fetchTree();
    } catch (err) {
      showAlertMsg(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const handleAdd = async () => {
    if (!addForm.menu_key.trim() || !addForm.title.trim()) {
      showAlertMsg('Menu Key and Title are required', 'danger'); 
      return;
    }
    setAddSaving(true);
    try {
      const payload = {
        menu_key: addForm.menu_key,
        title: addForm.title,
        icon: addForm.icon,
        url: addForm.url,
        parent_id: parseInt(addForm.parent_id, 10) || 0,
        sort_order: parseInt(addForm.sort_order, 10) || 0,
        is_active: addForm.is_active
      };
      await apiClient.post('/api/v1/admin/menus', payload);
      setShowAddModal(false);
      setAddForm({ menu_key: '', title: '', icon: '', url: '', parent_id: 0, sort_order: 0, is_active: true });
      fetchMenus();
      fetchDropdowns();
      fetchTree();
      showAlertMsg('Menu added successfully');
    } catch (err) {
      showAlertMsg(err.response?.data?.message || err.message || 'Failed to add menu', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

  const getParentTitle = (parentId) => {
    if (parentId === 0 || parentId === null || parentId === undefined) return "Root";
    const p = parentMenus.find(item => pid(item) === parentId);
    return p ? ptitle(p) : `#${parentId}`;
  };

  // Count total tree nodes for stats
  const countTreeNodes = (nodes) => {
    let count = 0;
    nodes.forEach(n => { count++; if (n.children) count += countTreeNodes(n.children); });
    return count;
  };

  const refreshAll = () => {
    fetchDropdowns();
    fetchMenus();
    fetchTree();
  };

  return (
    <div className="container-fluid p-0">
      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible position-fixed top-0 end-0 m-3 shadow-lg`} style={{ zIndex: 9999, minWidth: 280, borderRadius: 12 }}>
          {alert.msg}
          <button type="button" className="btn-close" onClick={() => setAlert(null)} />
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Menu Master
          </h4>
          <p className="text-muted small mb-0">Manage application menus and navigation • {menus.length} items</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant={showGuide ? 'outline-info' : 'light'} size="sm" className="rounded-pill border" onClick={() => setShowGuide(!showGuide)} title="Toggle Examples Guide">
            <Info size={16} /> {showGuide ? 'Hide Guide' : 'Guide'}
          </Button>
          <Button variant="light" size="sm" className="rounded-pill border" onClick={refreshAll} title="Refresh">
            <RefreshCw size={16} />
          </Button>
          <Button variant="success" className="d-flex align-items-center gap-2 rounded-pill shadow-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Menu
          </Button>
        </div>
      </div>

      <Row>
        {/* Main Content Column */}
        <Col xs={12} lg={showGuide ? 8 : 12}>

          {/* ── View Toggle Tabs ── */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <Nav variant="pills" activeKey={activeView} onSelect={k => setActiveView(k)} className="gap-1">
                  <Nav.Item>
                    <Nav.Link eventKey="list" className="d-flex align-items-center gap-1 py-1 px-3 rounded-pill" style={{fontSize:'0.85em'}}>
                      <List size={14} /> List View
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="tree" className="d-flex align-items-center gap-1 py-1 px-3 rounded-pill" style={{fontSize:'0.85em'}}>
                      <GitBranch size={14} /> Tree View
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                
                {activeView === 'list' && (
                  <InputGroup style={{maxWidth: 300}}>
                    <InputGroup.Text className="bg-transparent border-end-0 py-1"><Search size={14} className="text-muted" /></InputGroup.Text>
                    <Form.Control
                      size="sm"
                      placeholder="Search..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="bg-transparent border-start-0 shadow-none"
                    />
                    {search && <Button variant="light" size="sm" onClick={() => setSearch('')}><X size={12} /></Button>}
                  </InputGroup>
                )}

                {activeView === 'tree' && (
                  <div className="d-flex gap-1">
                    <Button variant="outline-success" size="sm" className="rounded-pill px-3" style={{fontSize:'0.78em'}} onClick={() => expandAll(treeData)}>
                      Expand All
                    </Button>
                    <Button variant="outline-secondary" size="sm" className="rounded-pill px-3" style={{fontSize:'0.78em'}} onClick={collapseAll}>
                      Collapse All
                    </Button>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* ── TREE VIEW ── */}
          {activeView === 'tree' && (
            <Card className="border-0 shadow-sm overflow-hidden mb-4">
              {treeLoading ? (
                <div className="d-flex align-items-center justify-content-center p-5">
                  <Spinner animation="border" variant="success" />
                </div>
              ) : treeData.length === 0 ? (
                <div className="text-center p-5 text-muted">
                  <GitBranch size={48} className="mb-3 opacity-25" />
                  <p>No menu tree data found</p>
                </div>
              ) : (
                <div>
                  {/* Tree Header */}
                  <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom" style={{background:'rgba(16,185,129,0.04)'}}>
                    <div className="d-flex align-items-center gap-2">
                      <GitBranch size={16} className="text-success" />
                      <span className="fw-semibold text-dark small">Menu Hierarchy</span>
                    </div>
                    <span className="text-muted small">{countTreeNodes(treeData)} active nodes • {treeData.length} root menus</span>
                  </div>

                  {/* Tree Body */}
                  <div style={{maxHeight: 500, overflowY: 'auto'}}>
                    {treeData.map((node, i) => (
                      <TreeNode
                        key={node.db_id || node.id || i}
                        node={node}
                        level={0}
                        expandedNodes={expandedNodes}
                        toggleNode={toggleNode}
                      />
                    ))}
                  </div>

                  {/* Tree Legend */}
                  <div className="d-flex align-items-center gap-4 px-3 py-2 border-top" style={{background:'#fafafa', fontSize:'0.75em'}}>
                    <span className="d-flex align-items-center gap-1">
                      <div className="bg-warning bg-opacity-10 rounded d-flex align-items-center justify-content-center" style={{width:20,height:20}}>
                        <Folder size={10} className="text-warning" />
                      </div>
                      <span className="text-muted">Parent Group</span>
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <div className="bg-success bg-opacity-10 rounded d-flex align-items-center justify-content-center" style={{width:20,height:20}}>
                        <FileText size={10} className="text-success" />
                      </div>
                      <span className="text-muted">Page / Leaf</span>
                    </span>
                    <span className="d-flex align-items-center gap-1 text-muted">Click parent to expand/collapse</span>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* ── LIST VIEW (Table) ── */}
          {activeView === 'list' && (
            <>
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
                          <th className="border-0" style={{width:40}}>#</th>
                          <th className="border-0">Title</th>
                          <th className="border-0">Menu Key</th>
                          <th className="border-0">URL</th>
                          <th className="border-0">Parent</th>
                          <th className="border-0" style={{width:80}}>Sort</th>
                          <th className="border-0 text-center" style={{width:80}}>Status</th>
                          <th className="border-0 text-end" style={{width:90}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {menus.map((m, idx) => {
                          const editing = editingId === m.MenuId;
                          const isActiveVal = m.IsActive === 'Y' || m.IsActive === 1 || m.IsActive === true;
                          const hasChildren = menus.some(c => c.ParentId === m.MenuId);
                          
                          return (
                            <tr key={m.MenuId} onDoubleClick={() => !editing && handleDoubleClick(m)}
                                style={{ cursor: editing ? 'default' : 'pointer' }}
                                className={editing ? 'table-success bg-opacity-25' : ''}
                                title={!editing ? 'Double-click to edit' : ''}>
                              <td className="text-muted small">{idx + 1}</td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div className={`rounded-circle d-flex align-items-center justify-content-center ${hasChildren ? 'bg-warning bg-opacity-10' : 'bg-success bg-opacity-10'}`} style={{ width: 30, height: 30, minWidth: 30 }}>
                                    <Menu size={14} className={hasChildren ? 'text-warning' : 'text-success'} />
                                  </div>
                                  {editing
                                    ? <Form.Control size="sm" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} autoFocus style={{maxWidth:160}} />
                                    : <span className="fw-semibold text-dark">{m.Title}</span>}
                                </div>
                              </td>
                              <td>
                                {editing
                                  ? <Form.Control size="sm" value={editForm.menu_key} onChange={e => setEditForm(f => ({ ...f, menu_key: e.target.value }))} style={{maxWidth:150}} />
                                  : <code className="text-primary small">{m.MenuKey}</code>}
                              </td>
                              <td>
                                {editing
                                  ? <Form.Control size="sm" placeholder="/path" value={editForm.url} onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))} style={{maxWidth:160}} />
                                  : m.Url && m.Url !== 'null' ? <span className="text-muted small">{m.Url}</span> : <span className="text-muted opacity-50">—</span>}
                              </td>
                              <td>
                                {editing
                                  ? (
                                    <Form.Select size="sm" value={editForm.parent_id} onChange={e => setEditForm(f => ({ ...f, parent_id: e.target.value }))} style={{minWidth:130}}>
                                      <option value="0">None (Root)</option>
                                      {parentMenus
                                        .filter(p => pid(p) !== m.MenuId)
                                        .map(p => (
                                          <option key={pid(p)} value={String(pid(p))}>{ptitle(p)}</option>
                                        ))}
                                    </Form.Select>
                                  )
                                  : (
                                    <span className={`badge ${m.ParentId ? 'bg-info bg-opacity-10 text-info' : 'bg-light text-secondary'} border fw-normal`}>
                                      {m.ParentId ? <><ChevronRight size={12} className="me-1" />{getParentTitle(m.ParentId)}</> : 'Root'}
                                    </span>
                                  )}
                              </td>
                              <td>
                                {editing
                                  ? <Form.Control type="number" size="sm" style={{ width: 60 }} value={editForm.sort_order} onChange={e => setEditForm(f => ({ ...f, sort_order: e.target.value }))} />
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
            </>
          )}
        </Col>

        {/* ── Side Guide Panel ── */}
        {showGuide && (
          <Col xs={12} lg={4}>
            <Card className="border-0 shadow-sm sticky-top" style={{ top: 16, background: 'linear-gradient(180deg, #f0fdf4 0%, #fff 100%)' }}>
              <Card.Header className="bg-transparent border-0 pt-3 pb-0">
                <h6 className="fw-bold text-success mb-0">📖 How to Fill Menu Fields</h6>
              </Card.Header>
              <Card.Body className="py-2 small">
                <div className="mb-3">
                  <div className="fw-semibold text-dark mb-1">Field Descriptions:</div>
                  <table className="table table-sm table-borderless mb-0" style={{fontSize:'0.82em'}}>
                    <tbody>
                      <tr><td className="fw-semibold text-nowrap pe-2" style={{width:90}}>Title</td><td className="text-muted">Display name shown in sidebar</td></tr>
                      <tr><td className="fw-semibold text-nowrap pe-2">Menu Key</td><td className="text-muted">Must <strong>exactly match</strong> <code>componentMap</code>. ALL CAPS.</td></tr>
                      <tr><td className="fw-semibold text-nowrap pe-2">URL</td><td className="text-muted">Route path. Empty for parent groups.</td></tr>
                      <tr><td className="fw-semibold text-nowrap pe-2">Parent</td><td className="text-muted"><strong>"None (Root)"</strong> = top-level group.</td></tr>
                      <tr><td className="fw-semibold text-nowrap pe-2">Sort Order</td><td className="text-muted">Lower = higher in sidebar.</td></tr>
                      <tr><td className="fw-semibold text-nowrap pe-2">Icon</td><td className="text-muted">Lucide icon name</td></tr>
                    </tbody>
                  </table>
                </div>

                <hr className="my-2" />

                <div className="fw-semibold text-dark mb-2">Examples:</div>
                {EXAMPLES.map((ex, i) => (
                  <Card key={i} className="mb-2 border" style={{background: 'rgba(255,255,255,0.7)'}}>
                    <Card.Body className="p-2">
                      <span className="badge bg-success bg-opacity-10 text-success fw-semibold mb-1" style={{fontSize:'0.75em'}}>{ex.label}</span>
                      <div className="text-muted mb-1" style={{fontSize:'0.78em'}}>{ex.desc}</div>
                      <div style={{fontSize:'0.75em', lineHeight: 1.8}}>
                        <div><span className="text-secondary">Title:</span> <strong>{ex.fields.title}</strong></div>
                        <div><span className="text-secondary">Key:</span> <code className="text-primary">{ex.fields.menu_key}</code></div>
                        <div><span className="text-secondary">URL:</span> {ex.fields.url || <em className="text-muted">empty</em>}</div>
                        <div><span className="text-secondary">Parent:</span> <Badge bg="light" className="text-dark border">{ex.fields.parent}</Badge></div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}

                <hr className="my-2" />
                <div className="p-2 rounded" style={{background:'#fffbeb', border:'1px solid #fde68a', fontSize:'0.78em'}}>
                  <strong className="text-warning">⚠️ Common Mistakes:</strong>
                  <ul className="mb-0 mt-1 ps-3">
                    <li>Menu Key <strong>must match</strong> <code>componentMap</code> in code</li>
                    <li>Parent groups should have <strong>empty URL</strong></li>
                    <li>Child menus need a <strong>valid parent</strong> selected</li>
                    <li>URL "null" text is invalid — leave it <strong>blank</strong></li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

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
                      <option key={pid(p)} value={String(pid(p))}>{ptitle(p)}</option>
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
                  <Form.Control placeholder="e.g. /dashboard (leave empty for parent groups)" value={addForm.url} onChange={e => setAddForm(f => ({ ...f, url: e.target.value }))} className="shadow-none rounded-3" />
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
