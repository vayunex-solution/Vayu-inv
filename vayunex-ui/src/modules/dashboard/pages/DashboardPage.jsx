// src/modules/dashboard/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Package, AlertTriangle, Tags, DollarSign, ArrowRight } from 'lucide-react';
import StatCard from '../components/StatCard';
import RecentItemsTable from '../components/RecentItemsTable';
import { getDashboardStats, getRecentItems } from '../services/dashboardService';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          getDashboardStats(),
          getRecentItems(5)
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (itemsRes.success) setRecentItems(itemsRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-5 text-center text-muted">Loading dashboard...</div>;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Dashboard</h4>
          <p className="text-muted small mb-0">Overview of your inventory status</p>
        </div>
        <Button variant="primary" className="shadow-sm d-flex align-items-center gap-2">
          Download Report <ArrowRight size={16} />
        </Button>
      </div>

      {/* Stats Grid */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <StatCard 
            title="Total Items" 
            value={stats?.totalItems || 0} 
            icon={Package}
            color="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            trend="+12% vs last month"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard 
            title="Low Stock" 
            value={stats?.lowStockItems || 0} 
            icon={AlertTriangle}
            color="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard 
            title="Categories" 
            value={stats?.totalCategories || 0} 
            icon={Tags}
            color="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard 
            title="Total Value" 
            value={`₹${Number(stats?.totalValue || 0).toLocaleString('en-IN')}`} 
            icon={DollarSign}
            color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            trend="+8.5% growth"
          />
        </Col>
      </Row>

      {/* Recent Items Table */}
      <RecentItemsTable items={recentItems} />
    </div>
  );
};

export default DashboardPage;
