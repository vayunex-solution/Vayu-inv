// src/modules/inventory/pages/ItemsListPage.jsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Eye, Package } from 'lucide-react';
import { getItems } from '../services/inventoryService';
import { getCategories } from '../../categories/services/categoryService';
import { useTabStore } from '../../../lib';

const ItemsListPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { openTab } = useTabStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, catRes] = await Promise.all([
          getItems({ search, category_id: categoryFilter ? parseInt(categoryFilter) : null }),
          getCategories()
        ]);
        if (itemsRes.success) setItems(itemsRes.data);
        if (catRes.success) setCategories(catRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Inventory Items</h4>
          <p className="text-muted small mb-0">{items.length} items in inventory</p>
        </div>
        <Button variant="primary" className="d-flex align-items-center gap-2">
          <Plus size={18} /> Add Item
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <Search size={16} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-start-0 ps-0"
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
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

      {/* Table */}
      <Card className="border-0 shadow-sm">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Table responsive hover className="align-middle mb-0">
            <thead className="bg-light text-secondary small">
              <tr>
                <th className="border-0">Code</th>
                <th className="border-0">Item Name</th>
                <th className="border-0">Category</th>
                <th className="border-0 text-end">Stock</th>
                <th className="border-0 text-end">Price</th>
                <th className="border-0 text-center">Status</th>
                <th className="border-0 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="font-monospace text-primary small fw-bold">{item.item_code}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-light rounded p-2">
                        <Package size={16} className="text-muted" />
                      </div>
                      <div>
                        <div className="fw-medium">{item.item_name}</div>
                        <small className="text-muted">HSN: {item.hsn_code}</small>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">{item.category_name}</td>
                  <td className="text-end">
                    <span className={item.quantity <= item.reorder_level ? 'text-warning fw-bold' : ''}>
                      {item.quantity}
                    </span>
                    <small className="text-muted ms-1">{item.unit}</small>
                  </td>
                  <td className="text-end">₹{item.unit_price.toLocaleString('en-IN')}</td>
                  <td className="text-center">
                    <Badge
                      bg={item.quantity <= item.reorder_level ? 'warning' : 'success'}
                      className="fw-normal"
                      style={{
                        color: item.quantity <= item.reorder_level ? '#b45309' : '#15803d',
                        backgroundColor: item.quantity <= item.reorder_level ? '#fef3c7' : '#dcfce7'
                      }}
                    >
                      {item.quantity <= item.reorder_level ? 'Low Stock' : 'Active'}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-1">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-muted p-1"
                        onClick={() => handleViewItem(item)}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button variant="link" size="sm" className="text-muted p-1">
                        <Edit size={16} />
                      </Button>
                      <Button variant="link" size="sm" className="text-danger p-1">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default ItemsListPage;
