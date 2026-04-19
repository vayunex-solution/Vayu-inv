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
import { 
  CountryMasterPage, 
  CityMasterPage, 
  StateMasterPage, 
  BrandMasterPage, 
  DistrictMasterPage, 
  FyMasterPage,
  ItemCategoryPage,
  HsnMasterPage,
  SequenceMasterPage,
  SequenceTransMasterPage,
  UnitMasterPage,
  ItemMasterPage,
  MenuMasterPage,
  AccountGroupMasterPage,
  AccountHeadMasterPage
} from '../../modules/masters';
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

  // Masters — DB menu_key is UPPERCASE
  COUNTRY_MASTER: CountryMasterPage,
  CITY_MASTER: CityMasterPage,
  STATE_MASTER: StateMasterPage,
  BRAND_MASTER: BrandMasterPage,
  DISTRICT_MASTER: DistrictMasterPage,
  FY_MASTER: FyMasterPage,

  // Item Category Master — multiple key variants for safety
  ITEM_CATEGORY: ItemCategoryPage,
  ITEM_CATEGORY_MASTER: ItemCategoryPage,
  item_category: ItemCategoryPage,
  ItemCategory: ItemCategoryPage,

  // HSN Master
  HSN: HsnMasterPage,
  HSN_MASTER: HsnMasterPage,
  hsn: HsnMasterPage,
  HsnMaster: HsnMasterPage,

  // Sequence
  SEQUANCE: SequenceMasterPage,
  sequance: SequenceMasterPage,
  Sequence: SequenceMasterPage,

  // Sequence Trans
  SEQUANCETRANS: SequenceTransMasterPage,
  sequancetrans: SequenceTransMasterPage,
  SequenceTrans: SequenceTransMasterPage,

  // Units
  UNIT_MASTER: UnitMasterPage,
  UnitMaster: UnitMasterPage,
  units: UnitMasterPage,

  // Items
  ITEM_MASTER: ItemMasterPage,
  ItemMaster: ItemMasterPage,
  ITEMS_MASTER: ItemMasterPage,
  ItemsMaster: ItemMasterPage,
  items_master: ItemMasterPage,

  // Admin Menus
  MENU: MenuMasterPage,
  Menu: MenuMasterPage,
  menu: MenuMasterPage,
  MENU_MASTER: MenuMasterPage,
  MenuMaster: MenuMasterPage,
  menus: MenuMasterPage,

  // Account Group
  ACCOUNTS_GROUPS: AccountGroupMasterPage,
  ACCOUNT_GROUP_MASTER: AccountGroupMasterPage,
  AccountGroupMaster: AccountGroupMasterPage,
  accountgroupmaster: AccountGroupMasterPage,
  account_group_master: AccountGroupMasterPage,
  accountgroup: AccountGroupMasterPage,
  AccountGroup: AccountGroupMasterPage,

  // Account Head
  ACCOUNT_HEADS: AccountHeadMasterPage,
  ACCOUNT_HEAD_MASTER: AccountHeadMasterPage,
  AccountHeadMaster: AccountHeadMasterPage,
  accountheadmaster: AccountHeadMasterPage,
  account_head_master: AccountHeadMasterPage,
  accounthead: AccountHeadMasterPage,
  AccountHead: AccountHeadMasterPage,

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
