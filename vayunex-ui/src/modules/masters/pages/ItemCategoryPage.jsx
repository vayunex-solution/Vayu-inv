// src/modules/masters/pages/ItemCategoryPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, FolderOpen, RefreshCw, ChevronRight } from 'lucide-react';
import { apiClient } from '../../../lib';

const BASE = '/api/v1/inventory/item-categories';

const ItemCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', description: '', is_active: 1 });
  const [addSaving, setAddSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const norm = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(BASE, { params: { search } });
      const data = norm(res);
      setCategories(data);
    } catch (err) {
      showAlert(err?.message || 'Failed to load categories', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ─── Inline Edit ───────────────────────────────────────
  const handleDoubleClick = (cat) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, description: cat.description || '', is_active: cat.is_active ?? 1 });
  };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    if (!editForm.name?.trim()) return showAlert('Category name is required', 'danger');
    setSavingId(id);
    try {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...editForm } : c));
      await apiClient.put(`${BASE}/${id}`, editForm);
      showAlert('Category updated successfully');
    } catch (err) {
      fetchCategories();
      showAlert(err?.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      cancelEdit();
    }
  };

  // ─── Delete ────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Items using it may be affected.')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`${BASE}/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
      showAlert('Category deleted');
    } catch (err) {
      showAlert(err?.message || 'Delete failed', 'danger');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Add Modal ─────────────────────────────────────────
  const openAddModal = () => {
    setAddForm({ name: '', description: '', is_active: 1 });
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!addForm.name?.trim()) return showAlert('Category name is required', 'danger');
    setAddSaving(true);
    try {
      const res = await apiClient.post(BASE, addForm);
      const created = res.data || res;
      setCategories(prev => [created, ...prev]);
      setShowAddModal(false);
      showAlert('Category added successfully');
    } catch (err) {
      showAlert(err?.message || 'Failed to add category', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible mb-3 shadow-sm`} role="alert">
          {alert.msg}
          <button type="button" className="btn-close" onClick={() => setAlert(null)} />
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 gradient-text d-flex align-items-center gap-2">
            <FolderOpen size={22} /> Item Categories
          </h4>
          <p className="text-muted small mb-0">{categories.length} categories • Double-tap row to quick edit</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" className="rounded-pill" onClick={fetchCategories} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </Button>
          <Button variant="primary" className="btn-glossy d-flex align-items-center gap-2 rounded-pill shadow-sm" onClick={openAddModal}>
            <Plus size={18} /> Add Category
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="glass-card border-0 mb-4">
        <Card.Body className="py-2">
          <InputGroup>
            <InputGroup.Text className="bg-transparent border-end-0"><Search size={15} className="text-muted" /></InputGroup.Text>
            <Form.Control
              placeholder="Search categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-start-0 shadow-none"
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="glass-card border-0 overflow-hidden">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center p-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <FolderOpen size={48} className="mb-3 opacity-25" />
            <p>No categories found. Add one to get started.</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <Table hover className="align-middle mb-0 d-none d-md-table">
              <thead className="bg-light bg-opacity-50">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">Name</th>
                  <th className="border-0">Description</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => {
                  const isEditing = editingId === cat.id;
                  return (
                    <tr
                      key={cat.id}
                      onDoubleClick={() => !isEditing && handleDoubleClick(cat)}
                      style={{ cursor: isEditing ? 'default' : 'pointer' }}
                      className={isEditing ? 'table-active' : ''}
                    >
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        {isEditing ? (
                          <Form.Control size="sm" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} autoFocus />
                        ) : (
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-primary bg-opacity-10 text-primary rounded p-1">
                              <FolderOpen size={16} />
                            </div>
                            <span className="fw-semibold">{cat.name}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <Form.Control size="sm" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" />
                        ) : (
                          <span className="text-muted small">{cat.description || '—'}</span>
                        )}
                      </td>
                      <td className="text-center">
                        {isEditing ? (
                          <Form.Select size="sm" style={{ width: 110 }} value={editForm.is_active} onChange={e => setEditForm(p => ({ ...p, is_active: parseInt(e.target.value) }))}>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                          </Form.Select>
                        ) : (
                          <Badge bg={cat.is_active ? 'success' : 'secondary'} className="bg-opacity-20 rounded-pill px-3 py-2" style={{ color: cat.is_active ? '#198754' : '#6c757d' }}>
                            {cat.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        )}
                      </td>
                      <td className="text-end">
                        {isEditing ? (
                          <div className="d-flex justify-content-end gap-2">
                            <Button variant="success" size="sm" className="rounded-circle btn-icon" onClick={() => saveEdit(cat.id)} disabled={savingId === cat.id}>
                              {savingId === cat.id ? <Spinner size="sm" animation="border" /> : <Check size={15} />}
                            </Button>
                            <Button variant="secondary" size="sm" className="rounded-circle btn-icon" onClick={cancelEdit} disabled={savingId === cat.id}>
                              <X size={15} />
                            </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-1">
                            <Button variant="light" size="sm" className="rounded-circle btn-icon text-primary" title="Edit" onClick={() => handleDoubleClick(cat)}>
                              <Edit size={15} />
                            </Button>
                            <Button variant="light" size="sm" className="rounded-circle btn-icon text-danger" title="Delete" onClick={() => handleDelete(cat.id)} disabled={deletingId === cat.id}>
                              {deletingId === cat.id ? <Spinner size="sm" animation="border" /> : <Trash2 size={15} />}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            {/* Mobile Cards */}
            <div className="d-block d-md-none">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="p-3 border-bottom d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, minWidth: 40 }}>
                    <FolderOpen size={18} />
                  </div>
                  <div className="flex-fill">
                    <div className="fw-semibold">{cat.name}</div>
                    <div className="small text-muted">{cat.description || '—'}</div>
                  </div>
                  <Badge bg={cat.is_active ? 'success' : 'secondary'} className="bg-opacity-15 rounded-pill" style={{ color: cat.is_active ? '#198754' : '#6c757d' }}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="d-flex gap-1">
                    <Button variant="light" size="sm" className="rounded-circle btn-icon text-primary" onClick={() => handleDoubleClick(cat)}><Edit size={14} /></Button>
                    <Button variant="light" size="sm" className="rounded-circle btn-icon text-danger" onClick={() => handleDelete(cat.id)}><Trash2 size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Add Category Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
            <FolderOpen size={20} className="text-primary" /> Add New Category
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Category Name <span className="text-danger">*</span></Form.Label>
            <Form.Control
              placeholder="e.g. Electronics, Raw Materials..."
              value={addForm.name}
              onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Short description (optional)"
              value={addForm.description}
              onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="fw-semibold small">Status</Form.Label>
            <Form.Select value={addForm.is_active} onChange={e => setAddForm(p => ({ ...p, is_active: parseInt(e.target.value) }))}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAddModal(false)} disabled={addSaving}>Cancel</Button>
          <Button variant="primary" className="btn-glossy rounded-pill px-4" onClick={handleAdd} disabled={addSaving}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : <><Check size={16} className="me-1" />Save Category</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ItemCategoryPage;
