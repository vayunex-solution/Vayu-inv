// src/modules/dashboard/components/StatCard.jsx
import { Card } from 'react-bootstrap';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <span className="text-muted small fw-bold text-uppercase">{title}</span>
            <h3 className="fw-bold mt-2 mb-0">{value}</h3>
          </div>
          <div 
            className="p-3 rounded-3 text-white d-flex align-items-center justify-content-center shadow-sm" 
            style={{ width: 48, height: 48, background: color }}
          >
            <Icon size={24} />
          </div>
        </div>
        {trend && (
          <div className="d-flex align-items-center gap-1 small text-success">
            <TrendingUp size={16} />
            <span className="fw-semibold">{trend}</span>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default StatCard;
