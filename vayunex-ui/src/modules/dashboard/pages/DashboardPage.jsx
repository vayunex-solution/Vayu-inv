// src/modules/dashboard/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Row, Col, Button, Badge } from 'react-bootstrap';
import { Package, AlertTriangle, Tags, DollarSign, Download, Clock, Activity, ShieldCheck } from 'lucide-react';
import StatCard from '../components/StatCard';
import RecentItemsTable from '../components/RecentItemsTable';
import { TrendAreaChart, CategoryPieChart } from '../components/InventoryCharts';
import { getDashboardStats, getRecentItems } from '../services/dashboardService';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, itemsRes] = await Promise.all([
        getDashboardStats(),
        getRecentItems(10) // Get more recent items for the new layout
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (itemsRes.success) setRecentItems(itemsRes.data);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Optional: Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted fw-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 pb-4">
      {/* ── Page Header ── */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>Overview Dashboard</h4>
          <div className="d-flex align-items-center text-muted small gap-2">
            <span className="d-flex align-items-center gap-1">
              <Activity size={12} className="text-success" /> Live Status
            </span>
            <span>•</span>
            <span className="d-flex align-items-center gap-1">
              <Clock size={12} /> Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <Button variant="success" className="shadow-sm d-flex align-items-center gap-2 rounded-pill px-4">
          <Download size={16} /> Export PDF
        </Button>
      </div>

      {/* ── KPIs / Stat Cards (Bento Grid Row 1) ── */}
      <Row className="g-3 mb-3">
        <Col xs={12} sm={6} xl={3}>
          <StatCard 
            title="Total Inventory Value" 
            value={`₹${Number(stats?.totalValue || 0).toLocaleString('en-IN')}`} 
            icon={DollarSign}
            color="#3b82f6" // Professional Blue
            trend="vs last month"
            trendValue="+8.5%"
            isPositive={true}
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard 
            title="Total Active Items" 
            value={stats?.totalItems || 0} 
            icon={Package}
            color="#8b5cf6" // Professional Violet
            trend="vs last month"
            trendValue="+12%"
            isPositive={true}
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard 
            title="Stock Health" 
            value={`${stats?.stockHealthPercent || 0}%`} 
            icon={ShieldCheck}
            color="#10b981" // Professional Emerald
            trend="healthy items"
            trendValue={`${stats?.healthyItems} items`}
            isPositive={stats?.stockHealthPercent > 80}
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard 
            title="Low Stock Alerts" 
            value={stats?.lowStockItems || 0} 
            icon={AlertTriangle}
            color="#ef4444" // Professional Red (Alert)
            trend="requires action"
            trendValue="Immediate"
            isPositive={stats?.lowStockItems === 0}
          />
        </Col>
      </Row>

      {/* ── Charts (Bento Grid Row 2) ── */}
      <Row className="g-3 mb-3">
        <Col xs={12} lg={8}>
           {stats?.trendData && <TrendAreaChart data={stats.trendData} />}
        </Col>
        <Col xs={12} lg={4}>
           {stats?.categoryData && <CategoryPieChart data={stats.categoryData} />}
        </Col>
      </Row>

      {/* ── Tables (Bento Grid Row 3) ── */}
      <Row className="g-3">
        <Col xs={12}>
          <RecentItemsTable items={recentItems} />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
