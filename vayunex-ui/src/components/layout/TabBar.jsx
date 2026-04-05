// src/components/layout/TabBar.jsx
import { Nav, Button, Badge } from 'react-bootstrap';
import { X, Plus } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useTabStore, useFyStore } from '../../lib';

const TabBar = () => {
  const { tabs, activeTabId, switchTab, closeTab, openTab } = useTabStore();
  const { selectedFyId, fys } = useFyStore();

  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent size={14} /> : null;
  };

  const currentFyName = () => {
    const fy = fys.find(f => String(f.FYID || f.FyId || f.fy_id) === String(selectedFyId));
    const name = fy?.FYNAME || fy?.FyName || fy?.fy_name;
    if (name) return name;
    return selectedFyId ? `FY #${selectedFyId}` : 'Select FY';
  };

  return (
    <div className="bg-white border-bottom px-3 pt-2 d-flex align-items-center gap-3">
      <Nav variant="tabs" className="border-bottom-0 flex-nowrap overflow-auto flex-grow-1" style={{ scrollbarWidth: 'none' }}>
        {tabs.map((tab) => (
          <Nav.Item key={tab.id} className="text-nowrap" style={{ minWidth: 140, maxWidth: 200 }}>
            <Nav.Link
              active={activeTabId === tab.id}
              onClick={() => switchTab(tab.id)}
              className={`d-flex align-items-center gap-2 px-3 py-2 small border-bottom-0 rounded-top ${activeTabId === tab.id ? 'bg-light fw-bold border text-primary' : 'text-secondary border-transparent'}`}
              style={{ cursor: 'pointer' }}
            >
              <span className={activeTabId === tab.id ? 'text-primary' : 'text-muted'}>
                {getIcon(tab.icon)}
              </span>
              <span className="text-truncate flex-fill">{tab.title}</span>
              {tab.closable && (
                <span
                  className="ms-2 opacity-50 hover-opacity-100 p-1 rounded-circle hover-bg-light"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  role="button"
                >
                  <X size={12} />
                </span>
              )}
            </Nav.Link>
          </Nav.Item>
        ))}

        <Nav.Item>
          <Button
            variant="link"
            size="sm"
            className="text-muted ms-2 mt-1"
            onClick={() => openTab({
              id: 'new-' + Date.now(),
              title: 'New Tab',
              component: 'empty',
              icon: 'Plus'
            })}
          >
            <Plus size={16} />
          </Button>
        </Nav.Item>
      </Nav>

      <div className="d-none d-md-flex align-items-center">
        <Badge bg="primary" className="rounded-pill px-3 py-2 text-white">
          Current FY: {currentFyName()}
        </Badge>
      </div>
    </div>
  );
};

export default TabBar;
