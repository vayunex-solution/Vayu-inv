// src/modules/masters/pages/MenuMasterPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal, Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  Plus, Search, Edit, Trash2, Check, X, Menu, RefreshCw, Info, ChevronRight, ChevronDown,
  FolderOpen, Folder, FileText, List, GitBranch, GripVertical, Link, Hash, Eye, EyeOff,
  PlusCircle, MoreHorizontal, Copy, ArrowRight
} from 'lucide-react';
import { apiClient } from '../../../lib';

/* ── helpers ── */
const pid = (obj) => obj?.MenuId ?? obj?.Id ?? obj?.id ?? obj?.menu_id ?? obj?.MenuID ?? 0;
const ptitle = (obj) => obj?.Title ?? obj?.title ?? '';

const normList = (data) =>
  data.map(m => ({
    MenuId: m.MenuId ?? m.Id ?? m.id ?? m.menu_id ?? m.MenuID ?? 0,
    MenuKey: m.MenuKey ?? m.menu_key ?? '',
    Title: m.Title ?? m.title ?? '',
    Icon: m.Icon ?? m.icon ?? '',
    Url: m.Url ?? m.url ?? '',
    ParentId: m.ParentId ?? m.parent_id ?? 0,
    SortOrder: m.SortOrder ?? m.sort_order ?? 0,
    IsActive: m.IsActive ?? m.is_active ?? m.IsStatus ?? true,
  }));

/* ── depth color palette ── */
const DEPTH_COLORS = [
  { bg: '#10b981', light: '#d1fae5', text: '#065f46', line: '#6ee7b7' },   // emerald
  { bg: '#3b82f6', light: '#dbeafe', text: '#1e40af', line: '#93c5fd' },   // blue
  { bg: '#8b5cf6', light: '#ede9fe', text: '#5b21b6', line: '#c4b5fd' },   // violet
  { bg: '#f59e0b', light: '#fef3c7', text: '#92400e', line: '#fcd34d' },   // amber
  { bg: '#ef4444', light: '#fee2e2', text: '#991b1b', line: '#fca5a5' },   // red
  { bg: '#06b6d4', light: '#cffafe', text: '#155e75', line: '#67e8f9' },   // cyan
];

const getDepthColor = (depth) => DEPTH_COLORS[depth % DEPTH_COLORS.length];

/* ── Example guide data ── */
const EXAMPLES = [
  { label: 'Root Menu (Group)', desc: 'Top-level group that holds child menus', fields: { title: 'Inventory-Setup', menu_key: 'INVENTORY_SETUP', icon: 'ClipboardList', url: '', parent: 'None (Root)', sort_order: 2 } },
  { label: 'Child Menu (Page)', desc: 'Actual page under a parent group', fields: { title: 'Items Master', menu_key: 'ITEMS_MASTER', icon: 'Box', url: '/inventory/items', parent: 'Inventory-Setup', sort_order: 1 } },
  { label: 'Admin Sub-menu', desc: 'Admin section child', fields: { title: 'Menu', menu_key: 'MENU_MASTER', icon: 'Menu', url: '/admin/Menu', parent: 'Admin', sort_order: 1 } }
];

/* ═══════════════════════════════════════════════
   ── Professional Tree Node Component ──
   ═══════════════════════════════════════════════ */
const TreeNode = ({
  node, depth = 0, expandedNodes, toggleNode,
  editingTreeId, setEditingTreeId, treeEditForm, setTreeEditForm,
  onTreeSave, onTreeDelete, savingTreeId, onAddChild, parentMenus, allMenus
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id || node.db_id);
  const isEditing = editingTreeId === (node.db_id || node.id);
  const isSaving = savingTreeId === (node.db_id || node.id);
  const color = getDepthColor(depth);
  const indent = depth * 28;

  const startEdit = (e) => {
    e.stopPropagation();
    setEditingTreeId(node.db_id || node.id);
    setTreeEditForm({
      menu_key: node.id || '',
      title: node.title || '',
      icon: node.icon || '',
      url: (node.url && node.url !== 'null') ? node.url : '',
      sort_order: node.sort_order ?? 0,
      is_active: true,
    });
  };

  const cancelEdit = (e) => {
    e?.stopPropagation();
    setEditingTreeId(null);
    setTreeEditForm({});
  };

  return (
    <>
      <div
        className="position-relative"
        style={{
          marginLeft: indent,
          transition: 'all 0.2s ease',
        }}
      >
        {/* Vertical connector line */}
        {depth > 0 && (
          <div style={{
            position: 'absolute',
            left: -14,
            top: 0,
            bottom: hasChildren && isExpanded ? 0 : '50%',
            width: 2,
            background: `linear-gradient(180deg, ${getDepthColor(depth - 1).line}, ${getDepthColor(depth - 1).line}80)`,
            borderRadius: 1,
          }} />
        )}
        {/* Horizontal connector */}
        {depth > 0 && (
          <div style={{
            position: 'absolute',
            left: -14,
            top: '50%',
            width: 14,
            height: 2,
            background: getDepthColor(depth - 1).line,
            borderRadius: 1,
          }} />
        )}

        {/* ── Node Card ── */}
        <div
          className={`d-flex align-items-center border rounded-3 mb-1 tree-node-card ${isEditing ? 'shadow' : ''}`}
          onClick={() => hasChildren && toggleNode(node.id || node.db_id)}
          style={{
            padding: isEditing ? '10px 12px' : '8px 12px',
            cursor: hasChildren ? 'pointer' : 'default',
            background: isEditing ? '#fff' : `linear-gradient(135deg, ${color.light}40, #fff)`,
            borderColor: isEditing ? color.bg : `${color.line}60`,
            borderLeft: `3px solid ${color.bg}`,
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
          onMouseEnter={e => { if (!isEditing) e.currentTarget.style.boxShadow = `0 2px 8px ${color.bg}15`; }}
          onMouseLeave={e => { if (!isEditing) e.currentTarget.style.boxShadow = 'none'; }}
        >
          {/* Expand/collapse chevron */}
          <div style={{ width: 22, minWidth: 22, textAlign: 'center', marginRight: 6 }}>
            {hasChildren ? (
              isExpanded
                ? <ChevronDown size={16} style={{ color: color.bg, transition: 'transform 0.2s' }} />
                : <ChevronRight size={16} style={{ color: color.bg, transition: 'transform 0.2s' }} />
            ) : (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color.bg, opacity: 0.4, margin: '0 auto' }} />
            )}
          </div>

          {/* Icon */}
          <div
            className="d-flex align-items-center justify-content-center rounded-2 me-2 flex-shrink-0"
            style={{ width: 32, height: 32, background: `${color.bg}15` }}
          >
            {hasChildren
              ? (isExpanded ? <FolderOpen size={16} style={{ color: color.bg }} /> : <Folder size={16} style={{ color: color.bg }} />)
              : <FileText size={16} style={{ color: color.bg }} />}
          </div>

          {/* ── Edit Mode ── */}
          {isEditing ? (
            <div className="flex-grow-1" onClick={e => e.stopPropagation()}>
              <Row className="g-2 align-items-center">
                <Col xs={12} md={3}>
                  <Form.Control
                    size="sm"
                    placeholder="Title"
                    value={treeEditForm.title}
                    onChange={e => setTreeEditForm(f => ({ ...f, title: e.target.value }))}
                    autoFocus
                    className="shadow-none rounded-2"
                    style={{ borderColor: color.line, fontSize: '0.85em' }}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <Form.Control
                    size="sm"
                    placeholder="MENU_KEY"
                    value={treeEditForm.menu_key}
                    onChange={e => setTreeEditForm(f => ({ ...f, menu_key: e.target.value.toUpperCase() }))}
                    className="shadow-none rounded-2 text-uppercase"
                    style={{ borderColor: color.line, fontSize: '0.82em' }}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <Form.Control
                    size="sm"
                    placeholder="/url"
                    value={treeEditForm.url}
                    onChange={e => setTreeEditForm(f => ({ ...f, url: e.target.value }))}
                    className="shadow-none rounded-2"
                    style={{ borderColor: color.line, fontSize: '0.82em' }}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <Form.Control
                    size="sm"
                    placeholder="Icon"
                    value={treeEditForm.icon}
                    onChange={e => setTreeEditForm(f => ({ ...f, icon: e.target.value }))}
                    className="shadow-none rounded-2"
                    style={{ borderColor: color.line, fontSize: '0.82em' }}
                  />
                </Col>
                <Col xs={6} md={1}>
                  <Form.Control
                    size="sm"
                    type="number"
                    placeholder="#"
                    value={treeEditForm.sort_order}
                    onChange={e => setTreeEditForm(f => ({ ...f, sort_order: e.target.value }))}
                    className="shadow-none rounded-2"
                    style={{ borderColor: color.line, fontSize: '0.82em', width: 55 }}
                  />
                </Col>
                <Col xs={6} md={2} className="d-flex gap-1 justify-content-end">
                  <Button
                    size="sm" variant="success"
                    onClick={(e) => { e.stopPropagation(); onTreeSave(node.db_id || node.id); }}
                    disabled={isSaving}
                    className="rounded-pill px-3 d-flex align-items-center gap-1"
                    style={{ fontSize: '0.8em' }}
                  >
                    {isSaving ? <Spinner size="sm" animation="border" /> : <><Check size={14} /> Save</>}
                  </Button>
                  <Button
                    size="sm" variant="outline-secondary"
                    onClick={cancelEdit}
                    className="rounded-pill px-2"
                    style={{ fontSize: '0.8em' }}
                  >
                    <X size={14} />
                  </Button>
                </Col>
              </Row>
            </div>
          ) : (
            /* ── Display Mode ── */
            <>
              <div className="flex-grow-1 d-flex align-items-center gap-2 flex-wrap">
                {/* Title */}
                <span className="fw-semibold" style={{ color: color.text, fontSize: depth === 0 ? '0.92em' : '0.86em' }}>
                  {node.title}
                </span>

                {/* Menu key pill */}
                <span
                  className="px-2 py-0 rounded-pill"
                  style={{ background: `${color.bg}12`, color: color.bg, fontSize: '0.7em', fontFamily: 'monospace', fontWeight: 600, border: `1px solid ${color.bg}25` }}
                >
                  {node.id}
                </span>

                {/* URL */}
                {node.url && node.url !== 'null' && (
                  <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.72em' }}>
                    <ArrowRight size={10} />
                    <span style={{ opacity: 0.8 }}>{node.url}</span>
                  </span>
                )}

                {/* Children count chip */}
                {hasChildren && (
                  <span
                    className="px-2 rounded-pill d-flex align-items-center gap-1"
                    style={{ background: `${color.bg}10`, color: color.bg, fontSize: '0.68em', fontWeight: 600 }}
                  >
                    {node.children.length} {node.children.length === 1 ? 'child' : 'children'}
                  </span>
                )}
              </div>

              {/* ── Action buttons (visible on hover via CSS) ── */}
              <div className="tree-actions d-flex gap-1 ms-2 flex-shrink-0" style={{ opacity: 0, transition: 'opacity 0.15s' }}>
                <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                  <button
                    className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-0"
                    style={{ width: 28, height: 28, background: `${color.bg}15`, border: `1px solid ${color.bg}30`, color: color.bg }}
                    onClick={startEdit}
                  >
                    <Edit size={13} />
                  </button>
                </OverlayTrigger>

                {(!hasChildren || node.children.length === 0) && (
                  <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                    <button
                      className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-0"
                      style={{ width: 28, height: 28, background: '#fee2e2', border: '1px solid #fca5a530', color: '#ef4444' }}
                      onClick={(e) => { e.stopPropagation(); onTreeDelete(node.db_id); }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </OverlayTrigger>
                )}

                <OverlayTrigger placement="top" overlay={<Tooltip>Add child under "{node.title}"</Tooltip>}>
                  <button
                    className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-0"
                    style={{ width: 28, height: 28, background: `${color.bg}15`, border: `1px solid ${color.bg}30`, color: color.bg }}
                    onClick={(e) => { e.stopPropagation(); onAddChild(node); }}
                  >
                    <PlusCircle size={13} />
                  </button>
                </OverlayTrigger>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Children ── */}
      {hasChildren && isExpanded && (
        <div style={{ marginLeft: indent + 14, position: 'relative' }}>
          {/* vertical line connecting children */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 16,
            width: 2,
            background: `linear-gradient(180deg, ${color.line}, ${color.line}30)`,
            borderRadius: 1,
          }} />
          {node.children.map((child, i) => (
            <TreeNode
              key={child.db_id || child.id || i}
              node={child}
              depth={depth + 1}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              editingTreeId={editingTreeId}
              setEditingTreeId={setEditingTreeId}
              treeEditForm={treeEditForm}
              setTreeEditForm={setTreeEditForm}
              onTreeSave={onTreeSave}
              onTreeDelete={onTreeDelete}
              savingTreeId={savingTreeId}
              onAddChild={onAddChild}
              parentMenus={parentMenus}
              allMenus={allMenus}
            />
          ))}
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════
   ── Main Page Component ──
   ═══════════════════════════════════════════════ */
const MenuMasterPage = () => {
  const [menus, setMenus] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [parentMenus, setParentMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState('tree');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);

  // Tree-specific edit state
  const [editingTreeId, setEditingTreeId] = useState(null);
  const [treeEditForm, setTreeEditForm] = useState({});
  const [savingTreeId, setSavingTreeId] = useState(null);

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
    setTimeout(() => setAlert(null), 3500);
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
        if (n.children?.length > 0) { ids.add(n.id || n.db_id); collect(n.children); }
      });
    };
    collect(nodes);
    setExpandedNodes(ids);
  };

  const collapseAll = () => setExpandedNodes(new Set());

  /* ── API calls ── */
  const fetchDropdowns = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/v1/admin/menus/dropdown').catch(() => ({ data: [] }));
      setParentMenus(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch { /* ignore */ }
  }, []);

  const fetchTree = useCallback(async () => {
    setTreeLoading(true);
    try {
      const res = await apiClient.get('/api/v1/admin/menus/tree');
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setTreeData(data);
      if (expandedNodes.size === 0 && data.length > 0) expandAll(data);
    } catch (err) {
      console.error('Tree load error:', err);
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
        ? data.filter(m => m.Title.toLowerCase().includes(search.toLowerCase()) || m.MenuKey.toLowerCase().includes(search.toLowerCase()))
        : data;
      setMenus(filtered);
    } catch (err) {
      showAlertMsg(err.response?.data?.message || 'Failed to load menus', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDropdowns().then(() => { fetchMenus(); fetchTree(); });
  }, [fetchDropdowns, fetchMenus, fetchTree]);

  const refreshAll = () => { fetchDropdowns(); fetchMenus(); fetchTree(); };

  /* ── List view edit handlers ── */
  const handleDoubleClick = (item) => {
    setEditingId(item.MenuId);
    setEditForm({
      menu_key: item.MenuKey, title: item.Title, icon: item.Icon || '', url: item.Url || '',
      parent_id: String(item.ParentId ?? 0), sort_order: item.SortOrder || 0,
      is_active: item.IsActive === 'Y' || item.IsActive === 1 || item.IsActive === true,
    });
  };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      await apiClient.put(`/api/v1/admin/menus/${id}`, {
        menu_key: editForm.menu_key, title: editForm.title, icon: editForm.icon, url: editForm.url,
        parent_id: parseInt(editForm.parent_id, 10) || 0, sort_order: parseInt(editForm.sort_order, 10) || 0,
        is_active: editForm.is_active,
      });
      showAlertMsg('Menu updated successfully');
      await fetchMenus(); await fetchTree();
    } catch (err) {
      showAlertMsg(err.response?.data?.message || 'Update failed', 'danger');
    } finally { setSavingId(null); setEditingId(null); }
  };

  /* ── Tree view edit handler ── */
  const onTreeSave = async (id) => {
    setSavingTreeId(id);
    try {
      await apiClient.put(`/api/v1/admin/menus/${id}`, {
        menu_key: treeEditForm.menu_key, title: treeEditForm.title, icon: treeEditForm.icon, url: treeEditForm.url,
        sort_order: parseInt(treeEditForm.sort_order, 10) || 0, is_active: treeEditForm.is_active ?? true,
      });
      showAlertMsg('Menu updated from tree');
      setEditingTreeId(null); setTreeEditForm({});
      await fetchTree(); await fetchMenus(); await fetchDropdowns();
    } catch (err) {
      showAlertMsg(err.response?.data?.message || 'Tree update failed', 'danger');
    } finally { setSavingTreeId(null); }
  };

  const onTreeDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await apiClient.delete(`/api/v1/admin/menus/${id}`);
      showAlertMsg('Menu deleted');
      fetchMenus(); fetchTree(); fetchDropdowns();
    } catch (err) {
      showAlertMsg(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const onAddChild = (parentNode) => {
    setAddForm({
      menu_key: '', title: '', icon: '', url: '',
      parent_id: parentNode.db_id || 0,
      sort_order: (parentNode.children?.length || 0) + 1,
      is_active: true,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await apiClient.delete(`/api/v1/admin/menus/${id}`);
      showAlertMsg('Menu deleted');
      fetchMenus(); fetchTree();
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
      await apiClient.post('/api/v1/admin/menus', {
        menu_key: addForm.menu_key, title: addForm.title, icon: addForm.icon, url: addForm.url,
        parent_id: parseInt(addForm.parent_id, 10) || 0, sort_order: parseInt(addForm.sort_order, 10) || 0,
        is_active: addForm.is_active,
      });
      setShowAddModal(false);
      setAddForm({ menu_key: '', title: '', icon: '', url: '', parent_id: 0, sort_order: 0, is_active: true });
      fetchMenus(); fetchDropdowns(); fetchTree();
      showAlertMsg('Menu added successfully');
    } catch (err) {
      showAlertMsg(err.response?.data?.message || err.message || 'Failed to add', 'danger');
    } finally { setAddSaving(false); }
  };

  const getParentTitle = (parentId) => {
    if (parentId === 0 || parentId == null) return "Root";
    const p = parentMenus.find(item => pid(item) === parentId);
    return p ? ptitle(p) : `#${parentId}`;
  };

  const countNodes = (nodes) => {
    let c = 0;
    nodes.forEach(n => { c++; if (n.children) c += countNodes(n.children); });
    return c;
  };

  /* ═══════════════════════════════════════════════
     ── Render ──
     ═══════════════════════════════════════════════ */
  return (
    <div className="container-fluid p-0">
      {/* ── Global Styles for tree hover ── */}
      <style>{`
        .tree-node-card:hover .tree-actions { opacity: 1 !important; }
        .tree-node-card { transition: all 0.15s ease; }
        .nav-pills .nav-link.active { background: linear-gradient(135deg, #10b981, #059669) !important; color: #fff !important; font-weight: 600; }
        .nav-pills .nav-link { color: #6b7280; font-weight: 500; }
        .tree-legend-item { display: flex; align-items: center; gap: 6px; }
      `}</style>

      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible position-fixed top-0 end-0 m-3 shadow-lg border-0`}
          style={{ zIndex: 9999, minWidth: 300, borderRadius: 14, backdropFilter: 'blur(10px)', background: alert.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)', color: '#fff' }}>
          <strong>{alert.type === 'success' ? '✅' : '❌'}</strong> {alert.msg}
          <button type="button" className="btn-close btn-close-white" onClick={() => setAlert(null)} />
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Menu Master
          </h4>
          <p className="text-muted small mb-0">Manage navigation hierarchy • {menus.length} items total</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Button variant={showGuide ? 'outline-info' : 'light'} size="sm" className="rounded-pill border" onClick={() => setShowGuide(!showGuide)}>
            <Info size={14} /> {showGuide ? 'Hide' : 'Guide'}
          </Button>
          <Button variant="light" size="sm" className="rounded-pill border" onClick={refreshAll}><RefreshCw size={14} /></Button>
          <Button variant="success" className="d-flex align-items-center gap-2 rounded-pill shadow-sm" onClick={() => { setAddForm({ menu_key: '', title: '', icon: '', url: '', parent_id: 0, sort_order: 0, is_active: true }); setShowAddModal(true); }}>
            <Plus size={16} /> Add Menu
          </Button>
        </div>
      </div>

      <Row>
        <Col xs={12} lg={showGuide ? 8 : 12}>
          {/* ── Tab Bar ── */}
          <Card className="border-0 shadow-sm mb-3">
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <Nav variant="pills" activeKey={activeView} onSelect={k => setActiveView(k)} className="gap-1">
                  <Nav.Item>
                    <Nav.Link eventKey="tree" className="d-flex align-items-center gap-1 py-1 px-3 rounded-pill" style={{ fontSize: '0.85em' }}>
                      <GitBranch size={14} /> Hierarchy
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="list" className="d-flex align-items-center gap-1 py-1 px-3 rounded-pill" style={{ fontSize: '0.85em' }}>
                      <List size={14} /> List
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                {activeView === 'list' && (
                  <InputGroup style={{ maxWidth: 280 }}>
                    <InputGroup.Text className="bg-transparent border-end-0 py-1"><Search size={14} className="text-muted" /></InputGroup.Text>
                    <Form.Control size="sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent border-start-0 shadow-none" />
                    {search && <Button variant="light" size="sm" onClick={() => setSearch('')}><X size={12} /></Button>}
                  </InputGroup>
                )}
                {activeView === 'tree' && (
                  <div className="d-flex gap-1">
                    <Button variant="outline-success" size="sm" className="rounded-pill px-3" style={{ fontSize: '0.78em' }} onClick={() => expandAll(treeData)}>
                      <ChevronDown size={12} className="me-1" />Expand All
                    </Button>
                    <Button variant="outline-secondary" size="sm" className="rounded-pill px-3" style={{ fontSize: '0.78em' }} onClick={collapseAll}>
                      <ChevronRight size={12} className="me-1" />Collapse
                    </Button>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* ═══════════════════════════════════════
             ── TREE VIEW ──
             ═══════════════════════════════════════ */}
          {activeView === 'tree' && (
            <Card className="border-0 shadow-sm overflow-hidden">
              {/* Header bar */}
              <div className="d-flex align-items-center justify-content-between px-3 py-2" style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', borderBottom: '1px solid #d1fae5' }}>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, background: '#10b98120' }}>
                    <GitBranch size={14} className="text-success" />
                  </div>
                  <span className="fw-bold text-dark" style={{ fontSize: '0.88em' }}>Navigation Tree</span>
                </div>
                <div className="d-flex align-items-center gap-3" style={{ fontSize: '0.75em' }}>
                  <span className="text-muted">{countNodes(treeData)} nodes</span>
                  <span className="text-muted">{treeData.length} root</span>
                </div>
              </div>

              {/* Tree body */}
              {treeLoading ? (
                <div className="d-flex align-items-center justify-content-center p-5">
                  <Spinner animation="border" variant="success" />
                </div>
              ) : treeData.length === 0 ? (
                <div className="text-center p-5 text-muted">
                  <GitBranch size={48} className="mb-3 opacity-25" />
                  <p>No tree data</p>
                </div>
              ) : (
                <div className="p-3" style={{ maxHeight: 550, overflowY: 'auto', background: '#fafbfc' }}>
                  {treeData.map((node, i) => (
                    <TreeNode
                      key={node.db_id || node.id || i}
                      node={node}
                      depth={0}
                      expandedNodes={expandedNodes}
                      toggleNode={toggleNode}
                      editingTreeId={editingTreeId}
                      setEditingTreeId={setEditingTreeId}
                      treeEditForm={treeEditForm}
                      setTreeEditForm={setTreeEditForm}
                      onTreeSave={onTreeSave}
                      onTreeDelete={onTreeDelete}
                      savingTreeId={savingTreeId}
                      onAddChild={onAddChild}
                      parentMenus={parentMenus}
                      allMenus={menus}
                    />
                  ))}
                </div>
              )}

              {/* Legend bar */}
              <div className="d-flex flex-wrap align-items-center gap-4 px-3 py-2 border-top" style={{ background: '#f9fafb', fontSize: '0.73em' }}>
                {DEPTH_COLORS.slice(0, 4).map((c, i) => (
                  <span key={i} className="tree-legend-item">
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: c.bg }} />
                    <span className="text-muted">Level {i}{i === 0 ? ' (Root)' : ''}</span>
                  </span>
                ))}
                <span className="ms-auto text-muted d-flex align-items-center gap-1">
                  <Edit size={10} /> Hover row for actions
                </span>
              </div>
            </Card>
          )}

          {/* ═══════════════════════════════════════
             ── LIST VIEW ──
             ═══════════════════════════════════════ */}
          {activeView === 'list' && (
            <>
              <Card className="border-0 shadow-sm overflow-hidden">
                {loading ? (
                  <div className="d-flex align-items-center justify-content-center p-5"><Spinner animation="border" variant="success" /></div>
                ) : menus.length === 0 ? (
                  <div className="text-center p-5 text-muted"><Menu size={48} className="mb-3 opacity-25" /><p>No menus found</p></div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0 text-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0" style={{ width: 40 }}>#</th>
                          <th className="border-0">Title</th>
                          <th className="border-0">Menu Key</th>
                          <th className="border-0">URL</th>
                          <th className="border-0">Parent</th>
                          <th className="border-0" style={{ width: 70 }}>Sort</th>
                          <th className="border-0 text-center" style={{ width: 80 }}>Status</th>
                          <th className="border-0 text-end" style={{ width: 90 }}>Actions</th>
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
                              className={editing ? 'table-success bg-opacity-25' : ''} title={!editing ? 'Double-click to edit' : ''}>
                              <td className="text-muted small">{idx + 1}</td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div className={`rounded-circle d-flex align-items-center justify-content-center ${hasChildren ? 'bg-warning bg-opacity-10' : 'bg-success bg-opacity-10'}`} style={{ width: 28, height: 28, minWidth: 28 }}>
                                    <Menu size={13} className={hasChildren ? 'text-warning' : 'text-success'} />
                                  </div>
                                  {editing
                                    ? <Form.Control size="sm" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} autoFocus style={{ maxWidth: 160 }} />
                                    : <span className="fw-semibold text-dark">{m.Title}</span>}
                                </div>
                              </td>
                              <td>{editing ? <Form.Control size="sm" value={editForm.menu_key} onChange={e => setEditForm(f => ({ ...f, menu_key: e.target.value }))} style={{ maxWidth: 150 }} /> : <code className="text-primary small">{m.MenuKey}</code>}</td>
                              <td>{editing ? <Form.Control size="sm" placeholder="/path" value={editForm.url} onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))} style={{ maxWidth: 150 }} /> : m.Url && m.Url !== 'null' ? <span className="text-muted small">{m.Url}</span> : <span className="text-muted opacity-50">—</span>}</td>
                              <td>
                                {editing ? (
                                  <Form.Select size="sm" value={editForm.parent_id} onChange={e => setEditForm(f => ({ ...f, parent_id: e.target.value }))} style={{ minWidth: 120 }}>
                                    <option value="0">None (Root)</option>
                                    {parentMenus.filter(p => pid(p) !== m.MenuId).map(p => (
                                      <option key={pid(p)} value={String(pid(p))}>{ptitle(p)}</option>
                                    ))}
                                  </Form.Select>
                                ) : (
                                  <span className={`badge ${m.ParentId ? 'bg-info bg-opacity-10 text-info' : 'bg-light text-secondary'} border fw-normal`}>
                                    {m.ParentId ? <><ChevronRight size={12} className="me-1" />{getParentTitle(m.ParentId)}</> : 'Root'}
                                  </span>
                                )}
                              </td>
                              <td>{editing ? <Form.Control type="number" size="sm" style={{ width: 55 }} value={editForm.sort_order} onChange={e => setEditForm(f => ({ ...f, sort_order: e.target.value }))} /> : <span className="fw-medium">{m.SortOrder}</span>}</td>
                              <td className="text-center">{editing ? <Form.Check type="switch" checked={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} /> : <Badge bg={isActiveVal ? 'success' : 'secondary'} className="rounded-pill px-3 fw-normal">{isActiveVal ? 'Active' : 'Inactive'}</Badge>}</td>
                              <td className="text-end">
                                {editing ? (
                                  <div className="d-flex justify-content-end gap-1">
                                    <Button size="sm" variant="success" onClick={() => saveEdit(m.MenuId)} disabled={savingId === m.MenuId} className="rounded-circle p-1 text-white shadow-sm" style={{ width: 28, height: 28 }}>
                                      {savingId === m.MenuId ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={cancelEdit} className="rounded-circle p-1 shadow-sm" style={{ width: 28, height: 28 }}><X size={14} /></Button>
                                  </div>
                                ) : (
                                  <div className="d-flex justify-content-end gap-1">
                                    <Button size="sm" variant="light" className="rounded-circle p-1 border-0" style={{ width: 28, height: 28 }} onClick={() => handleDoubleClick(m)}><Edit size={14} className="text-muted" /></Button>
                                    <Button size="sm" variant="light" className="rounded-circle p-1 border-0" style={{ width: 28, height: 28 }} onClick={() => handleDelete(m.MenuId)}><Trash2 size={14} className="text-danger" /></Button>
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

        {/* ── Side Guide ── */}
        {showGuide && (
          <Col xs={12} lg={4}>
            <Card className="border-0 shadow-sm sticky-top" style={{ top: 16, background: 'linear-gradient(180deg, #f0fdf4 0%, #fff 100%)' }}>
              <Card.Header className="bg-transparent border-0 pt-3 pb-0">
                <h6 className="fw-bold text-success mb-0">📖 How to Fill Menu Fields</h6>
              </Card.Header>
              <Card.Body className="py-2 small">
                <table className="table table-sm table-borderless mb-2" style={{ fontSize: '0.82em' }}>
                  <tbody>
                    <tr><td className="fw-semibold text-nowrap pe-2" style={{ width: 85 }}>Title</td><td className="text-muted">Display name in sidebar</td></tr>
                    <tr><td className="fw-semibold text-nowrap pe-2">Menu Key</td><td className="text-muted">Must match <code>componentMap</code>. ALL CAPS.</td></tr>
                    <tr><td className="fw-semibold text-nowrap pe-2">URL</td><td className="text-muted">Route path. Empty for groups.</td></tr>
                    <tr><td className="fw-semibold text-nowrap pe-2">Parent</td><td className="text-muted">"None (Root)" = top-level.</td></tr>
                    <tr><td className="fw-semibold text-nowrap pe-2">Sort</td><td className="text-muted">Lower = higher.</td></tr>
                  </tbody>
                </table>
                <hr className="my-2" />
                {EXAMPLES.map((ex, i) => (
                  <Card key={i} className="mb-2 border" style={{ background: 'rgba(255,255,255,0.7)' }}>
                    <Card.Body className="p-2">
                      <Badge bg="success" className="bg-opacity-10 text-success mb-1" style={{ fontSize: '0.72em' }}>{ex.label}</Badge>
                      <div style={{ fontSize: '0.74em', lineHeight: 1.7 }}>
                        <div><span className="text-secondary">Title:</span> <strong>{ex.fields.title}</strong></div>
                        <div><span className="text-secondary">Key:</span> <code>{ex.fields.menu_key}</code></div>
                        <div><span className="text-secondary">URL:</span> {ex.fields.url || <em className="text-muted">empty</em>}</div>
                        <div><span className="text-secondary">Parent:</span> {ex.fields.parent}</div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
                <div className="p-2 mt-2 rounded" style={{ background: '#fffbeb', border: '1px solid #fde68a', fontSize: '0.76em' }}>
                  <strong className="text-warning">⚠️ Mistakes to avoid:</strong>
                  <ul className="mb-0 mt-1 ps-3">
                    <li>Key must match <code>componentMap</code></li>
                    <li>Groups = empty URL</li>
                    <li>Don't type "null" as URL</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* ── Add Modal ── */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            {parseInt(addForm.parent_id) > 0 ? `Add Child Menu` : 'Add New Menu'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={e => { e.preventDefault(); handleAdd(); }}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Parent Menu</Form.Label>
                  <Form.Select value={addForm.parent_id} onChange={e => setAddForm(f => ({ ...f, parent_id: e.target.value }))} className="shadow-none rounded-3">
                    <option value={0}>None (Root Menu)</option>
                    {parentMenus.map(p => <option key={pid(p)} value={String(pid(p))}>{ptitle(p)}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control required placeholder="e.g. Dashboard" value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} className="shadow-none rounded-3" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Menu Key <span className="text-danger">*</span></Form.Label>
                  <Form.Control required placeholder="e.g. DASHBOARD" value={addForm.menu_key} onChange={e => setAddForm(f => ({ ...f, menu_key: e.target.value.toUpperCase() }))} className="shadow-none rounded-3 text-uppercase" />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">URL / Route</Form.Label>
                  <Form.Control placeholder="/dashboard (empty for groups)" value={addForm.url} onChange={e => setAddForm(f => ({ ...f, url: e.target.value }))} className="shadow-none rounded-3" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Icon</Form.Label>
                  <Form.Control placeholder="LayoutDashboard" value={addForm.icon} onChange={e => setAddForm(f => ({ ...f, icon: e.target.value }))} className="shadow-none rounded-3" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Sort Order</Form.Label>
                  <Form.Control type="number" min="0" value={addForm.sort_order} onChange={e => setAddForm(f => ({ ...f, sort_order: e.target.value }))} className="shadow-none rounded-3" />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Check type="switch" label={<span className="fw-medium text-dark ms-1">Active</span>} checked={addForm.is_active} onChange={e => setAddForm(f => ({ ...f, is_active: e.target.checked }))} />
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
