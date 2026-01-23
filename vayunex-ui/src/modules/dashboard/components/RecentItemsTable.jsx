// src/modules/dashboard/components/RecentItemsTable.jsx
import { Card, Table, Badge, Button } from 'react-bootstrap';

const RecentItemsTable = ({ items }) => {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom-0 py-3 d-flex justify-content-between align-items-center">
        <h6 className="fw-bold mb-0">Recent Items</h6>
        <Button variant="link" size="sm" className="text-decoration-none">View All</Button>
      </Card.Header>
      <Table responsive hover className="align-middle mb-0">
        <thead className="bg-light text-secondary small">
          <tr>
            <th className="border-0">Item Code</th>
            <th className="border-0">Name</th>
            <th className="border-0">Category</th>
            <th className="border-0 text-end">Stock</th>
            <th className="border-0 text-end">Price</th>
            <th className="border-0 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="font-monospace text-primary small fw-bold">
                {item.item_code}
              </td>
              <td className="fw-medium">{item.item_name}</td>
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
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default RecentItemsTable;
