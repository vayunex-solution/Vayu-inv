import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../lib';

const BASE = '/api/v1/inventory/items';

const ItemMasterPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const initialForm = {
    itemName: '', itemCode: '', itemDescription: '', hsnCode: '', 
    isTaxable: 1, unitOfMeasurement: 0, purchaseRate: '', salesRate: '', mrp: '', 
    openingStock: '', minStockLevel: '', maxStockLevel: '', 
    itemType: 'Goods', category: 0, brand: 0, isActive: 1,
    isExempted: 0, isNilRated: 0, reverseChargeApplicable: 0
  };
  const [form, setForm] = useState(initialForm);
  const [alert, setAlert] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(BASE);
      setList(Array.isArray(res.data) ? res.data : []);
      setAlert(null);
    } catch (err) {
      setAlert({ type: 'danger', msg: err?.response?.data?.message || err.message || 'Failed to fetch Items' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [catRes, unitRes, brandRes] = await Promise.all([
        apiClient.get('/api/v1/inventory/item-categories/dropdown').catch(() => ({ data: [] })),
        apiClient.get('/api/v1/inventory/units/dropdown').catch(() => ({ data: [] })),
        apiClient.get('/api/v1/inventory/brands/dropdown').catch(() => ({ data: [] }))
      ]);
      setCategories(Array.isArray(catRes.data) ? catRes.data : (catRes || []));
      setUnits(Array.isArray(unitRes.data) ? unitRes.data : (unitRes || []));
      setBrands(Array.isArray(brandRes.data) ? brandRes.data : (brandRes || []));
    } catch (err) {
      console.error("Failed to load dropdowns", err);
    }
  };

  useEffect(() => {
    fetchList();
    fetchDropdowns();
  }, [fetchList]);

  const handleOpenAdd = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setEditingId(item.ItemId || item.itemId);
    setForm({
      itemName: item.ItemName || item.itemName || '',
      itemCode: item.ItemCode || item.itemCode || '',
      itemDescription: item.ItemDescription || item.itemDescription || '',
      hsnCode: item.HSNCode || item.hsnCode || '',
      isTaxable: item.IsTaxable !== undefined ? item.IsTaxable : (item.isTaxable || 1),
      unitOfMeasurement: item.UnitOfMeasurement || item.unitOfMeasurement || 0,
      purchaseRate: item.PurchaseRate || item.purchaseRate || '',
      salesRate: item.SalesRate || item.salesRate || '',
      mrp: item.MRP || item.mrp || '',
      openingStock: item.OpeningStock !== undefined ? item.OpeningStock : (item.openingStock || 0),
      minStockLevel: item.MinStockLevel !== undefined ? item.MinStockLevel : (item.minStockLevel || 0),
      maxStockLevel: item.MaxStockLevel !== undefined ? item.MaxStockLevel : (item.maxStockLevel || 0),
      itemType: item.ItemType || item.itemType || 'Goods',
      category: item.Category || item.category || 0,
      brand: item.Brand || item.brand || 0,
      isActive: item.IsActive !== undefined ? item.IsActive : (item.isActive || 1),
      isExempted: item.IsExempted !== undefined ? item.IsExempted : (item.isExempted || 0),
      isNilRated: item.IsNilRated !== undefined ? item.IsNilRated : (item.isNilRated || 0),
      reverseChargeApplicable: item.ReverseChargeApplicable !== undefined ? item.ReverseChargeApplicable : (item.reverseChargeApplicable || 0)
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        isTaxable: parseInt(form.isTaxable, 10),
        unitOfMeasurement: parseInt(form.unitOfMeasurement, 10) || 0,
        purchaseRate: parseFloat(form.purchaseRate) || 0,
        salesRate: parseFloat(form.salesRate) || 0,
        mrp: parseFloat(form.mrp) || 0,
        openingStock: parseFloat(form.openingStock) || 0,
        minStockLevel: parseFloat(form.minStockLevel) || 0,
        maxStockLevel: parseFloat(form.maxStockLevel) || 0,
        category: parseInt(form.category, 10) || 0,
        brand: parseInt(form.brand, 10) || 0,
        isActive: parseInt(form.isActive, 10),
        isExempted: parseInt(form.isExempted, 10),
        isNilRated: parseInt(form.isNilRated, 10),
        reverseChargeApplicable: parseInt(form.reverseChargeApplicable, 10),
        createdBy: 1,
        modifiedBy: editingId ? 1 : null
      };

      if (editingId) {
        await apiClient.put(`${BASE}/${editingId}`, payload);
        setAlert({ type: 'success', msg: 'Item updated successfully!' });
      } else {
        await apiClient.post(BASE, payload);
        setAlert({ type: 'success', msg: 'Item added successfully!' });
      }
      setShowModal(false);
      fetchList();
    } catch (err) {
      setAlert({ type: 'danger', msg: err?.response?.data?.message || err.message || 'Error saving Item' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Item?')) return;
    try {
      setDeletingId(id);
      await apiClient.delete(`${BASE}/${id}`);
      setAlert({ type: 'success', msg: 'Item deleted successfully!' });
      fetchList();
    } catch (err) {
      setAlert({ type: 'danger', msg: err?.response?.data?.message || err.message || 'Error deleting Item' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredList = list.filter(item => {
    if (!search) return true;
    const term = search.toLowerCase();
    const c = (item.ItemCode || item.itemCode || '').toLowerCase();
    const n = (item.ItemName || item.itemName || '').toLowerCase();
    return c.includes(term) || n.includes(term);
  });

  return (
    <div className="state-master-container p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h4 className="fw-bold fs-4 mb-1" style={{ color: "var(--bs-primary)" }}>Item Master</h4>
          <p className="text-muted mb-0 small">Manage products, raw materials, and services</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" onClick={fetchList} disabled={loading} className="d-flex align-items-center gap-2 border">
            <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
          </Button>
          <Button variant="primary" onClick={handleOpenAdd} className="d-flex align-items-center gap-2 shadow-sm rounded-3">
            <Plus size={18} /> Add Item
          </Button>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show border-0 shadow-sm rounded-3`} role="alert">
          {alert.msg}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          <div className="bg-light p-3 border-bottom d-flex gap-3 align-items-center">
            <InputGroup className="w-auto me-auto" style={{ minWidth: '280px' }}>
              <InputGroup.Text className="bg-white border-end-0 text-muted">
                <Search size={16} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by Item Code or Name..."
                className="border-start-0 ps-0 shadow-none bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </div>

          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="px-4 text-secondary fw-semibold py-3">Code</th>
                  <th className="text-secondary fw-semibold py-3">Item Name</th>
                  <th className="text-secondary fw-semibold py-3">Type</th>
                  <th className="text-secondary fw-semibold py-3">HSN</th>
                  <th className="text-secondary fw-semibold py-3 text-end">Sales Rate</th>
                  <th className="text-secondary fw-semibold py-3 text-center">Status</th>
                  <th className="text-secondary fw-semibold py-3 pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5 text-muted"><Spinner animation="border" size="sm" className="me-2" /> Loading items...</td></tr>
                ) : filteredList.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-5 text-muted">No items found.</td></tr>
                ) : (
                  filteredList.map((item) => {
                    const id = item.ItemId || item.itemId;
                    const active = item.IsActive !== undefined ? item.IsActive : item.isActive;
                    return (
                      <tr key={id}>
                        <td className="px-4 fw-medium">{item.ItemCode || item.itemCode}</td>
                        <td className="text-dark fw-medium">{item.ItemName || item.itemName}</td>
                        <td>{item.ItemType || item.itemType}</td>
                        <td>{item.HSNCode || item.hsnCode || '-'}</td>
                        <td className="text-end fw-semibold text-primary">₹{(item.SalesRate || item.salesRate || 0).toFixed(2)}</td>
                        <td className="text-center">
                          <Badge bg={active === 1 ? 'success' : 'danger'} className="px-2 py-1 rounded-pill fw-normal">
                            {active === 1 ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="pe-4 text-end">
                          <Button variant="light" size="sm" onClick={() => handleEditClick(item)} className="mx-1 text-secondary">
                            <Edit size={16} />
                          </Button>
                          <Button variant="light" size="sm" onClick={() => handleDelete(id)} disabled={deletingId === id} className="text-danger">
                            {deletingId === id ? <Spinner size="sm" animation="border" /> : <Trash2 size={16} />}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered backdrop="static">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fs-5 fw-bold text-dark">{editingId ? 'Edit Item' : 'Add New Item'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-3">
            {/* Nav style partitioning for visual spacing */}
            <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Basic Info</h6>
            <Row className="g-3 mb-4">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Item Code</Form.Label>
                  <Form.Control placeholder="Optional/Auto" value={form.itemCode} onChange={e => setForm({...form, itemCode: e.target.value.toUpperCase()})} />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Item Name *</Form.Label>
                  <Form.Control required placeholder="Enter item name" value={form.itemName} onChange={e => setForm({...form, itemName: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Item Type</Form.Label>
                  <Form.Select value={form.itemType} onChange={e => setForm({...form, itemType: e.target.value})}>
                    <option value="Goods">Goods</option>
                    <option value="Services">Services</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Row className="g-3 mt-1 mb-2">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary mb-1">Category</Form.Label>
                      <Form.Select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                        <option value={0}>Select Category</option>
                        {categories.map(c => <option key={c.CategoryId || c.categoryId} value={c.CategoryId || c.categoryId}>{c.CategoryName || c.categoryName}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary mb-1">Brand</Form.Label>
                      <Form.Select value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}>
                        <option value={0}>Select Brand</option>
                        {brands.map(b => <option key={b.BrandId || b.brandId} value={b.BrandId || b.brandId}>{b.BrandName || b.brandName}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary mb-1">Unit of Measurement</Form.Label>
                      <Form.Select value={form.unitOfMeasurement} onChange={e => setForm({...form, unitOfMeasurement: e.target.value})}>
                        <option value={0}>Select Unit</option>
                        {units.map(u => <option key={u.UnitId || u.unitId || u.UnitID} value={u.UnitId || u.unitId || u.UnitID}>{u.UnitName || u.unitName || u.UnitCode || u.unitCode}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Description</Form.Label>
                  <Form.Control as="textarea" rows={2} value={form.itemDescription} onChange={e => setForm({...form, itemDescription: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Pricing & Taxation</h6>
            <Row className="g-3 mb-4">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Purchase Rate</Form.Label>
                  <Form.Control type="number" step="0.01" value={form.purchaseRate} onChange={e => setForm({...form, purchaseRate: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Sales Rate</Form.Label>
                  <Form.Control type="number" step="0.01" value={form.salesRate} onChange={e => setForm({...form, salesRate: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">MRP</Form.Label>
                  <Form.Control type="number" step="0.01" value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">HSN/SAC Code</Form.Label>
                  <Form.Control value={form.hsnCode} onChange={e => setForm({...form, hsnCode: e.target.value})} />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Is Taxable?</Form.Label>
                  <Form.Select value={form.isTaxable} onChange={e => setForm({...form, isTaxable: e.target.value})}>
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Is Exempted?</Form.Label>
                  <Form.Select value={form.isExempted} onChange={e => setForm({...form, isExempted: e.target.value})}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Is Nil Rated?</Form.Label>
                  <Form.Select value={form.isNilRated} onChange={e => setForm({...form, isNilRated: e.target.value})}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Reverse Charge</Form.Label>
                  <Form.Select value={form.reverseChargeApplicable} onChange={e => setForm({...form, reverseChargeApplicable: e.target.value})}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Inventory Settings</h6>
            <Row className="g-3 mb-2">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Status</Form.Label>
                  <Form.Select value={form.isActive} onChange={e => setForm({...form, isActive: e.target.value})}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Opening Stock</Form.Label>
                  <Form.Control type="number" step="0.01" value={form.openingStock} onChange={e => setForm({...form, openingStock: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Min Stock Level</Form.Label>
                  <Form.Control type="number" step="0.01" value={form.minStockLevel} onChange={e => setForm({...form, minStockLevel: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">Max Stock Level</Form.Label>
                  <Form.Control type="number" step="0.01" value={form.maxStockLevel} onChange={e => setForm({...form, maxStockLevel: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>

          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-2 bg-light rounded-bottom-4">
            <Button variant="outline-secondary" onClick={() => setShowModal(false)} className="px-4 bg-white">Cancel</Button>
            <Button variant="primary" type="submit" disabled={saving} className="px-4 shadow-sm">
              {saving ? <Spinner size="sm" animation="border" className="me-2" /> : null}
              {editingId ? 'Update Item' : 'Save Item'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ItemMasterPage;
