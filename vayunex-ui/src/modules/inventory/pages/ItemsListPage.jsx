// src/modules/inventory/pages/ItemsListPage.jsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Pagination } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Eye, Package, Check, X } from 'lucide-react';
import { getItems, updateItem } from '../services/inventoryService';
import { getCategories } from '../../categories/services/categoryService';
import { useTabStore } from '../../../lib';

const ItemsListPage = () => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Double tap to edit state
  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);

  const { openTab } = useTabStore();

  const fetchItems = async (page = 1) => {
    setLoading(true);
    try {
      const itemsRes = await getItems({ 
        search, 
        category_id: categoryFilter ? parseInt(categoryFilter) : null,
        page,
        limit: pagination.limit
      });
      if (itemsRes.success) {
        // Handle both paginated object and direct array
        const fetchedItems = itemsRes.data?.items || itemsRes.data || [];
        setItems(fetchedItems);
        if (itemsRes.data?.pagination) setPagination(itemsRes.data.pagination);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(1);
    
    // Fetch categories only once
    const fetchCats = async () => {
      const catRes = await getCategories();
      if (catRes.success) setCategories(catRes.data);
    };
    fetchCats();
  }, [search, categoryFilter]);

  const handleViewItem = (item) => {
    openTab({
      id: `item-${item.id}`,
      title: item.item_name,
      component: 'ItemDetail',
      props: { itemId: item.id },
      icon: 'Package'
    });
  };

  // --- Double Tap to Edit Logic ---
  const handleDoubleClick = (item) => {
    if (editingItemId === item.id) return;
    setEditingItemId(item.id);
    setEditForm({ 
      unit_price: item.unit_price, 
      quantity: item.quantity,
      status: item.status || 'active'
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      // Optimistic UI update
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...editForm } : item
      ));
      
      const res = await updateItem(id, editForm);
      if (!res.success) {
        // Revert on failure
        fetchItems(pagination.page);
        alert('Failed to save changes');
      }
    } finally {
      setSavingId(null);
      setEditingItemId(null);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 gradient-text">Inventory Items</h4>
          <p className="text-muted small mb-0">{items.length} items found</p>
        </div>
        <Button variant="primary" className="btn-glossy d-flex align-items-center gap-2 rounded-pill shadow-sm">
          <Plus size={18} /> Add New Item
        </Button>
      </div>

      {/* Filters (Glassmorphism Card) */}
      <Card className="glass-card mb-4 border-0">
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} md={8}>
              <InputGroup className="glass-input-group">
                <InputGroup.Text className="bg-transparent border-end-0 border-light">
                  <Search size={16} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search item code or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-start-0 border-light ps-0 shadow-none text-dark"
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={4}>
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="glass-input border-light bg-transparent text-dark shadow-none"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Mobile Card View vs Desktop Table View */}
      <Card className="glass-card border-0 overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center p-5 text-muted">No items found.</div>
        ) : (
          <div className="table-responsive">
            {/* Desktop Table */}
            <Table hover className="align-middle mb-0 inventory-table d-none d-lg-table">
              <thead className="bg-light bg-opacity-50">
                <tr>
                  <th className="border-0">Code / Name</th>
                  <th className="border-0 text-end">Price (₹)</th>
                  <th className="border-0 text-center">Stock</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isEditing = editingItemId === item.id;
                  const isLowStock = item.quantity <= (item.reorder_level || 5);
                  
                  return (
                    <tr 
                      key={item.id} 
                      onDoubleClick={() => !isEditing && handleDoubleClick(item)}
                      style={{ cursor: isEditing ? 'default' : 'pointer' }}
                      className={isEditing ? 'table-active' : ''}
                      title={!isEditing ? "Double tap to edit" : ""}
                    >
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary bg-opacity-10 text-primary rounded p-2 d-none d-sm-block">
                            <Package size={20} />
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{item.item_name}</div>
                            <div className="d-flex gap-2 align-items-center">
                                <small className="font-monospace text-primary bg-primary bg-opacity-10 px-1 rounded">{item.item_code}</small>
                                <small className="text-muted">{item.category_name || 'General'}</small>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end" style={{ width: '150px' }}>
                        {isEditing ? (
                          <Form.Control 
                            type="number" 
                            size="sm"
                            value={editForm.unit_price} 
                            onChange={(e) => handleEditChange('unit_price', e.target.value)}
                            className="text-end"
                          />
                        ) : (
                          <span className="fw-medium">₹{parseFloat(item.unit_price).toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="text-center" style={{ width: '120px' }}>
                        {isEditing ? (
                          <Form.Control 
                            type="number" 
                            size="sm"
                            value={editForm.quantity} 
                            onChange={(e) => handleEditChange('quantity', e.target.value)}
                            className="text-center"
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            <span className={`fw-bold ${isLowStock ? 'text-danger' : 'text-success'}`}>{item.quantity}</span>
                            <small className="text-muted">{item.unit || 'PCS'}</small>
                          </div>
                        )}
                      </td>
                      <td className="text-center" style={{ width: '120px' }}>
                         {isEditing ? (
                           <Form.Select 
                             size="sm" 
                             value={editForm.status || 'active'}
                             onChange={(e) => handleEditChange('status', e.target.value)}
                           >
                             <option value="active">Active</option>
                             <option value="inactive">Inactive</option>
                           </Form.Select>
                         ) : (
                           <Badge 
                             bg={isLowStock ? 'danger' : 'success'} 
                             className="fw-normal rounded-pill px-3 py-2 bg-opacity-25"
                             style={{ color: isLowStock ? '#dc3545' : '#198754' }}
                           >
                             {isLowStock ? 'Low Stock' : 'In Stock'}
                           </Badge>
                         )}
                      </td>
                      <td className="text-end">
                        {isEditing ? (
                          <div className="d-flex justify-content-end gap-2">
                             <Button variant="success" size="sm" onClick={() => saveEdit(item.id)} disabled={savingId === item.id} className="btn-icon rounded-circle p-1">
                                {savingId === item.id ? <Spinner size="sm" animation="border" /> : <Check size={16} />}
                             </Button>
                             <Button variant="danger" size="sm" onClick={cancelEdit} disabled={savingId === item.id} className="btn-icon rounded-circle p-1">
                                <X size={16} />
                             </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-1">
                            <Button variant="light" size="sm" className="btn-icon rounded-circle text-primary hover-glass" onClick={() => handleViewItem(item)}>
                              <Eye size={16} />
                            </Button>
                            <Button variant="light" size="sm" className="btn-icon rounded-circle text-muted hover-glass" onClick={() => handleDoubleClick(item)}>
                              <Edit size={16} />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            {/* Mobile View Cards */}
            <div className="d-block d-lg-none mt-2">
               {items.map(item => {
                 const isEditing = editingItemId === item.id;
                 const isLowStock = item.quantity <= (item.reorder_level || 5);
                 
                 return (
                   <div key={item.id} className={`p-3 border-bottom ${isEditing ? 'bg-light' : ''}`} onDoubleClick={() => !isEditing && handleDoubleClick(item)}>
                     <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="fw-bold">{item.item_name}</div>
                          <small className="font-monospace text-primary bg-primary bg-opacity-10 px-1 rounded">{item.item_code}</small>
                        </div>
                        <Badge bg={isLowStock ? 'danger' : 'success'} className="bg-opacity-25" style={{ color: isLowStock ? '#dc3545' : '#198754' }}>
                           {isLowStock ? 'Low Stock' : 'Active'}
                        </Badge>
                     </div>
                     
                     {isEditing ? (
                       <div className="mb-3 p-3 bg-white rounded shadow-sm border">
                          <Form.Group className="mb-2">
                            <Form.Label className="small text-muted mb-1">Price (₹)</Form.Label>
                            <Form.Control type="number" size="sm" value={editForm.unit_price} onChange={(e) => handleEditChange('unit_price', e.target.value)} />
                          </Form.Group>
                          <Row className="g-2 mb-3">
                            <Col>
                              <Form.Label className="small text-muted mb-1">Stock</Form.Label>
                              <Form.Control type="number" size="sm" value={editForm.quantity} onChange={(e) => handleEditChange('quantity', e.target.value)} />
                            </Col>
                            <Col>
                              <Form.Label className="small text-muted mb-1">Status</Form.Label>
                              <Form.Select size="sm" value={editForm.status || 'active'} onChange={(e) => handleEditChange('status', e.target.value)}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </Form.Select>
                            </Col>
                          </Row>
                          <div className="d-flex justify-content-end gap-2">
                            <Button variant="danger" size="sm" className="flex-fill rounded-pill" onClick={cancelEdit}>Cancel</Button>
                            <Button variant="success" size="sm" className="flex-fill rounded-pill" onClick={() => saveEdit(item.id)} disabled={savingId === item.id}>Save</Button>
                          </div>
                       </div>
                     ) : (
                       <div className="d-flex justify-content-between align-items-end mt-2">
                         <div>
                           <div className="text-muted small">Price</div>
                           <div className="fw-bold">₹{parseFloat(item.unit_price).toLocaleString('en-IN')}</div>
                         </div>
                         <div className="text-end">
                           <div className="text-muted small">Stock</div>
                           <div className="fw-bold">{item.quantity} <span className="fw-normal text-muted small">{item.unit || 'PCS'}</span></div>
                         </div>
                       </div>
                     )}
                     
                     {!isEditing && (
                       <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                          <Button variant="light" size="sm" className="flex-fill text-primary" onClick={() => handleViewItem(item)}>
                            <Eye size={16} className="me-1" /> View
                          </Button>
                          <Button variant="light" size="sm" className="flex-fill text-muted" onClick={() => handleDoubleClick(item)}>
                            <Edit size={16} className="me-1" /> Edit
                          </Button>
                       </div>
                     )}
                   </div>
                 );
               })}
            </div>
          </div>
        )}
      </Card>
      
      {/* Pagination component to be implemented if required */}
      <div className="d-flex justify-content-center mt-4">
          <small className="text-muted text-center d-block">✨ Tip: Double tap any item row to quick edit</small>
      </div>
    </div>
  );
};

export default ItemsListPage;

