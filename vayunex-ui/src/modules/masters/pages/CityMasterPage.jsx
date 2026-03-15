// src/modules/masters/pages/CityMasterPage.jsx
import { Building2 } from 'lucide-react';

const CityMasterPage = () => (
  <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
    <div className="text-center p-5">
      <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: 80, height: 80 }}>
        <Building2 size={36} className="text-primary" />
      </div>
      <h4 className="fw-bold mb-2">City Master</h4>
      <p className="text-muted mb-4">City management module is coming soon.<br />Backend API integration pending.</p>
      <span className="badge bg-warning text-dark rounded-pill px-4 py-2">🚧 In Development</span>
    </div>
  </div>
);

export default CityMasterPage;
