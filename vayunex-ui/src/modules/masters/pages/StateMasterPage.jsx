// src/modules/masters/pages/StateMasterPage.jsx
import { MapPin } from 'lucide-react';

const StateMasterPage = () => (
  <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
    <div className="text-center p-5">
      <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: 80, height: 80 }}>
        <MapPin size={36} className="text-info" />
      </div>
      <h4 className="fw-bold mb-2">State Master</h4>
      <p className="text-muted mb-4">State management module is coming soon.<br />Backend API integration pending.</p>
      <span className="badge bg-warning text-dark rounded-pill px-4 py-2">🚧 In Development</span>
    </div>
  </div>
);

export default StateMasterPage;
