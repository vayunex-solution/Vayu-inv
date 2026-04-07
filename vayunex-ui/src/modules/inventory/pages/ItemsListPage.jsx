// src/modules/inventory/pages/ItemsListPage.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Package, Check, X, AlertCircle } from 'lucide-react';
import { getItems, updateItem, getItemCategories, createItem } from '../services/inventoryService';
import { getHsnDropdown } from '../services/hsnService';
import { useTabStore, useFyStore } from '../../../lib';


const ItemsListPage = () => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [hsnFilter, setHsnFilter] = useState('');
  
  // Double tap to edit state
  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    item_name: '',
    item_code: '',
    category_id: '',
    hsn_code: '',
    tax_rate: 0,
    unit: 'PCS',
    unit_price: '',
    quantity: '',
    reorder_level: 5,
    description: ''
  });
  const [addSaving, setAddSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const { openTab } = useTabStore();
  const { selectedFyId } = useFyStore();

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };


  const fetchItems = async (page = 1) => {
    setLoading(true);
    try {
      const itemsRes = await getItems({ 
        search, 
        category_id: categoryFilter ? parseInt(categoryFilter) : null,
        hsn_code: hsnFilter || null,
        // fy_id auto-injected by apiClient interceptor
        page,
        limit: pagination.limit
      });
      if (itemsRes.success) {
        // Service returns { items: [...], pagination: {...} }
        const fetchedItems = itemsRes.data?.items || [];
        const pag = itemsRes.data?.pagination;
        setItems(fetchedItems);
        if (pag) setPagination(prev => ({ ...prev, ...pag }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(1);

    // Fetch categories with normalization
    const fetchCats = async () => {
      const catRes = await getItemCategories();
      if (catRes.success) {
        const raw = Array.isArray(catRes.data) ? catRes.data : (Array.isArray(catRes.data?.data) ? catRes.data.data : []);
        const norm = raw.map(c => ({
          id: c.id ?? c.Id ?? c.CategoryId ?? c.ID,
          name: c.name ?? c.Name ?? c.CategoryName ?? ''
        }));
        setCategories(norm);
      }
    };
    // Fetch HSN with normalization
    const fetchHsn = async () => {
      const hsnRes = await getHsnDropdown();
      if (hsnRes.success) {
        const raw = Array.isArray(hsnRes.data) ? hsnRes.data : (Array.isArray(hsnRes.data?.data) ? hsnRes.data.data : []);
        const norm = raw.map(h => ({
          id: h.id ?? h.Id ?? h.HsnId ?? h.ID,
          hsn_code: h.hsn_code ?? h.HSNCode ?? h.HsnCode ?? '',
          description: h.description ?? h.Description ?? '',
          tax_rate: parseFloat(h.tax_rate ?? h.TaxRate ?? h.GST_Rate ?? 0)
        }));
        setHsnCodes(norm);
      }
    };
    fetchCats();
    fetchHsn();

  }, [search, categoryFilter, hsnFilter, selectedFyId]);

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
        fetchItems(pagination.page);
        showAlert(res.error?.message || 'Failed to save changes', 'danger');
      } else {
        showAlert('Item updated successfully');
      }
    } finally {
      setSavingId(null);
      setEditingItemId(null);
    }
  };

  // --- Add Item Logic ---
  const handleOpenAdd = () => {
    setAddForm({
      item_name: '',
      item_code: `ITM${Math.floor(1000 + Math.random() * 9000)}`,
      category_id: categories[0]?.id || '',
      hsn_code: '',
      tax_rate: 0,
      unit: 'PCS',
      unit_price: '',
      quantity: '',
      reorder_level: 5,
      description: ''
    });
    setShowAddModal(true);
  };

  const handleHsnChange = (code) => {
    const selected = hsnCodes.find(h => h.hsn_code === code);
    setAddForm(prev => ({
      ...prev,
      hsn_code: code,
      tax_rate: selected ? selected.tax_rate : prev.tax_rate
    }));
  };

  const handleAddSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!addForm.item_name || !addForm.item_code) {
      showAlert('Item Name and Code are required', 'danger');
      return;
    }
    setAddSaving(true);
    try {
      const res = await createItem(addForm);
      if (res.success) {
        showAlert('Item added successfully');
        setShowAddModal(false);
        fetchItems(1);
      } else {
        showAlert(res.error?.message || 'Failed to add item', 'danger');
      }
    } catch (err) {
      showAlert('An unexpected error occurred', 'danger');
    } finally {
      setAddSaving(false);
    }
  };


  return (
    <div className="container-fluid p-0">
      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible position-fixed top-0 end-0 m-3 shadow-lg fade show`} style={{ zIndex: 9999 }}>
          <div className="d-flex align-items-center gap-2">
            {alert.type === 'danger' ? <AlertCircle size={18} /> : <Check size={18} />}
            {alert.msg}
          </div>
          <button type="button" className="btn-close" onClick={() => setAlert(null)} />
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 gradient-text">Inventory Items Master</h4>
          <p className="text-muted small mb-0">{pagination.total ?? items.length} items configured in system</p>
        </div>
        <Button variant="primary" className="btn-glossy d-flex align-items-center gap-2 rounded-pill shadow-sm" onClick={handleOpenAdd}>
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
            <Col xs={6} md={2}>
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
            <Col xs={6} md={2}>
              <Form.Select
                value={hsnFilter}
                onChange={(e) => setHsnFilter(e.target.value)}
                className="glass-input border-light bg-transparent text-dark shadow-none"
              >
                <option value="">All HSN</option>
                {hsnCodes.map(h => {
                  // Support multiple response shapes from API
                  const code = h.hsn_code || h.HSNCode || h.code || h.value;
                  const name = h.description || h.HSNDescription || h.name || h.label;
                  return <option key={code} value={code}>{code}{name ? ` - ${name}` : ''}</option>;
                })}
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
                  <th className="border-0 text-center">HSN</th>
                  <th className="border-0 text-center">Tax%</th>
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
                      <td className="text-center" style={{ width: '110px' }}>
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
                      <td className="text-center" style={{ width: '100px' }}>
                        <Badge bg="secondary" className="bg-opacity-10 text-secondary fw-medium px-2 py-2 rounded-pill">
                          {item.hsn_code || '-'}
                        </Badge>
                      </td>
                      <td className="text-center" style={{ width: '80px' }}>
                        <small className="text-muted">{item.tax_rate != null ? `${item.tax_rate}%` : '-'}</small>
                      </td>
                      <td className="text-center" style={{ width: '110px' }}>
                         {isEditing ? (
                           <Form.Select 
                             size="sm" 
                             value={editForm.status || 'active'}
                             onChange={(e) => handleEditChange('status', e.target.value)}
                           >
                             <option value="active">Active</option>
                             <option value="inactive">Inactive</option>
                             <option value="discontinued">Discontinued</option>
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
                        <Badge 
                          className="border-0 rounded-pill px-2 py-1 fw-bold" 
                          style={{ 
                            backgroundColor: isLowStock ? '#fee2e2' : '#dcfce7', 
                            color: isLowStock ? '#991b1b' : '#166534',
                            fontSize: '0.65rem'
                          }}
                        >
                           {isLowStock ? 'LOW STOCK' : 'ACTIVE'}
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
                                <option value="discontinued">Discontinued</option>
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
                         <div className="text-center">
                           <div className="text-muted small">HSN</div>
                           <div className="fw-semibold text-secondary">{item.hsn_code || '-'}</div>
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
      
      <div className="d-flex justify-content-center mt-4 pb-5">
          <small className="text-muted text-center d-block">✨ Tip: Double tap any item row to quick edit stocks and prices</small>
      </div>

      {/* Add Item Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
            <Package size={22} className="text-primary" /> Add New Inventory Item
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form onSubmit={handleAddSubmit}>
            <Row className="g-3">
              <Col xs={12} md={8}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Item Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    placeholder="e.g. Dell Latitude 5420 Laptop"
                    value={addForm.item_name}
                    onChange={e => setAddForm(p => ({ ...p, item_name: e.target.value }))}
                    autoFocus
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Item Code (SKU) <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    placeholder="e.g. ITM001"
                    value={addForm.item_code}
                    onChange={e => setAddForm(p => ({ ...p, item_code: e.target.value }))}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Category</Form.Label>
                  <Form.Select value={addForm.category_id} onChange={e => setAddForm(p => ({ ...p, category_id: e.target.value }))}>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Unit of Measure</Form.Label>
                  <Form.Select value={addForm.unit} onChange={e => setAddForm(p => ({ ...p, unit: e.target.value }))}>
                    <option value="PCS">PCS (Pieces)</option>
                    <option value="KG">KG (Kilograms)</option>
                    <option value="LTR">LTR (Liters)</option>
                    <option value="MTR">MTR (Meters)</option>
                    <option value="BOX">BOX</option>
                    <option value="SET">SET</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">HSN Code</Form.Label>
                  <Form.Select value={addForm.hsn_code} onChange={e => handleHsnChange(e.target.value)}>
                    <option value="">No HSN</option>
                    {hsnCodes.map(h => (
                      <option key={h.hsn_code} value={h.hsn_code}>
                        {h.hsn_code} {h.description ? `(${h.description.substring(0, 30)}...)` : ''}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">GST Tax Rate (%)</Form.Label>
                  <Form.Control 
                    type="number"
                    value={addForm.tax_rate}
                    onChange={e => setAddForm(p => ({ ...p, tax_rate: parseFloat(e.target.value) }))}
                    placeholder="Auto-filled from HSN"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Reorder Level</Form.Label>
                  <Form.Control 
                    type="number"
                    value={addForm.reorder_level}
                    onChange={e => setAddForm(p => ({ ...p, reorder_level: parseInt(e.target.value) }))}
                  />
                  <Form.Text className="text-muted smaller">Notify when stock below this</Form.Text>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Unit Price (₹)</Form.Label>
                  <Form.Control 
                    type="number"
                    placeholder="0.00"
                    value={addForm.unit_price}
                    onChange={e => setAddForm(p => ({ ...p, unit_price: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Initial Stock Quantity</Form.Label>
                  <Form.Control 
                    type="number"
                    placeholder="0"
                    value={addForm.quantity}
                    onChange={e => setAddForm(p => ({ ...p, quantity: e.target.value }))}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Description</Form.Label>
                  <Form.Control 
                    as="textarea"
                    rows={2}
                    placeholder="Product details, dimensions, warranty info..."
                    value={addForm.description}
                    onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAddModal(false)} disabled={addSaving}>Cancel</Button>
          <Button variant="primary" className="btn-glossy rounded-pill px-4 shadow-sm" onClick={handleAddSubmit} disabled={addSaving}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Adding...</> : <><Check size={18} className="me-1" />Save Item</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>

  );
};

export default ItemsListPage;
