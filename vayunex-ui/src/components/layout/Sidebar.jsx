// src/components/layout/Sidebar.jsx
import { useState } from 'react';
import { Nav, Collapse } from 'react-bootstrap';
import {
  LayoutDashboard, Package, Tags, Ruler, ArrowLeftRight,
  FileText, ClipboardList, AlertTriangle, Settings,
  ChevronDown, ChevronRight, X, Leaf, Box
} from 'lucide-react';
import { companyConfig } from '../../config/company';
import { useTabStore, apiClient } from '../../lib';
import { useEffect, useState } from 'react';

const iconMap = {
  LayoutDashboard, Package, Tags, Ruler, ArrowLeftRight,
  FileText, ClipboardList, AlertTriangle, Settings, Box
};

const MenuItem = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { openTab, activeTabId } = useTabStore();
  const hasChildren = item.children && item.children.length > 0;
  const Icon = iconMap[item.icon] || FileText;
  const isActive = activeTabId === item.id;

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else if (item.url) {
      openTab({
        id: item.id,
        title: item.title,
        component: item.id,
        icon: item.icon
      });
    }
  };

  return (
    <>
      <Nav.Item>
        <Nav.Link
          onClick={handleClick}
          className={`d-flex align-items-center justify-content-between ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${1 + level * 0.5}rem` }}
        >
          <div className="d-flex align-items-center gap-2">
            <Icon size={18} />
            <span>{item.title}</span>
          </div>
          {hasChildren && (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
        </Nav.Link>
      </Nav.Item>

      {hasChildren && (
        <Collapse in={isOpen}>
          <div>
            {item.children.map(child => (
              <MenuItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        </Collapse>
      )}
    </>
  );
};

const Sidebar = ({ show, onHide }) => {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await apiClient.get('/api/v1/admin/menus/tree');
        // Handle both standard response format and direct array
        setMenuData(response.data || response || []);
      } catch (error) {
        console.error('Failed to fetch menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <>
      {/* Backdrop for mobile */}
      {show && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 999 }}
          onClick={onHide}
        />
      )}

      <div className={`sidebar d-flex flex-column ${show ? 'show' : ''}`}>
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom h-navbar">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-success text-white p-1 rounded-2 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
              <Leaf size={18} />
            </div>
            <div>
              <h6 className="mb-0 fw-bold">{companyConfig.name}</h6>
              <small className="text-muted d-block lh-1">Inventory Pro</small>
            </div>
          </div>
          <button className="btn btn-link text-muted d-lg-none p-0" onClick={onHide}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-fill overflow-auto p-3">
          <small className="text-muted fw-bold text-uppercase ls-1 d-block mb-3" style={{ fontSize: '0.75rem' }}>
            Main Menu
          </small>
          <Nav className="flex-column">
            {loading ? (
              <div className="p-3 text-center">
                <div className="spinner-border spinner-border-sm text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              menuData.map(item => (
                <MenuItem key={item.id} item={item} />
              ))
            )}
          </Nav>
        </div>

        <div className="p-3 border-top mt-auto">
          <div className="bg-light p-3 rounded-3 border">
            <div className="d-flex gap-2">
              <div className="text-warning">
                <Box size={20} />
              </div>
              <div>
                <small className="fw-bold d-block">PRO Plan</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Using 45% of storage</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
