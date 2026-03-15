// src/components/layout/AppLayout.jsx
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import TabBar from './TabBar';
import { useTabStore } from '../../lib';

// Import pages from modules
import { DashboardPage } from '../../modules/dashboard';
import { ItemsListPage, CountriesPage } from '../../modules/inventory';
import { CategoriesPage } from '../../modules/categories';
import { CountryMasterPage, CityMasterPage, StateMasterPage } from '../../modules/masters';
import { Sparkles } from 'lucide-react';

// Component mapping — keys must match item.id from the sidebar menu API
const componentMap = {
  // Dashboard
  dashboard: DashboardPage,
  Dashboard: DashboardPage,

  // Inventory
  items: ItemsListPage,
  countries: CountriesPage,
  categories: CategoriesPage,

  // Masters
  country_master: CountryMasterPage,
  'Country Master': CountryMasterPage,
  CountryMaster: CountryMasterPage,
  city_master: CityMasterPage,
  'City Master': CityMasterPage,
  CityMaster: CityMasterPage,
  state_master: StateMasterPage,
  'State Master': StateMasterPage,
  StateMaster: StateMasterPage,

  empty: () => (
    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted p-5">
      <Sparkles size={48} className="mb-3 text-secondary" />
      <h5 className="fw-light">Workspace Ready</h5>
      <p className="small">Select an item from the menu to get started</p>
    </div>
  )
};

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { tabs, activeTabId } = useTabStore();

  const activeTab = tabs.find(t => t.id === activeTabId);
  const ActiveComponent = componentMap[activeTab?.component] || componentMap.empty;

  return (
    <div className="d-flex h-100 overflow-hidden">
      <Sidebar
        show={sidebarOpen}
        onHide={() => setSidebarOpen(false)}
      />

      <div className="main-content flex-fill d-flex flex-column h-100 w-100 position-relative">
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        <TabBar />

        <main className="flex-fill overflow-auto bg-light p-4">
          <div className="container-fluid p-0">
            <ActiveComponent {...(activeTab?.props || {})} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
