// src/modules/dashboard/components/StatCard.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, isPositive }) => {
  return (
    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
      <div 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '150px',
          height: '150px',
          background: color,
          opacity: 0.05,
          borderRadius: '50%',
          transform: 'translate(30%, -30%)'
        }}
      />
      <Card.Body className="p-4 d-flex flex-column justify-content-between position-relative z-1">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <p className="text-muted fw-semibold mb-1" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
            <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.5px' }}>{value}</h3>
          </div>
          <div 
            className="d-flex align-items-center justify-content-center" 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: `${color}15`,
              color: color
            }}
          >
            <Icon size={24} />
          </div>
        </div>
        
        {trend && (
          <div className="d-flex align-items-center mt-auto pt-2 border-top" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            <div className={`d-flex align-items-center px-2 py-1 rounded-pill me-2 ${isPositive === true ? 'bg-success bg-opacity-10 text-success' : isPositive === false ? 'bg-danger bg-opacity-10 text-danger' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {isPositive === true && <TrendingUp size={12} className="me-1" />}
              {isPositive === false && <TrendingDown size={12} className="me-1" />}
              {isPositive === null && <Minus size={12} className="me-1" />}
              {trendValue}
            </div>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>{trend}</span>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default StatCard;
