// src/lib/TabManager.js
// Shared tab management store using Zustand

import { create } from 'zustand';

const useTabStore = create((set, get) => ({
  tabs: [
    { id: 'dashboard', title: 'Dashboard', component: 'dashboard', icon: 'LayoutDashboard', closable: false }
  ],
  activeTabId: 'dashboard',
  
  openTab: (tab) => {
    const { tabs } = get();
    const existingTab = tabs.find(t => t.id === tab.id);
    
    if (existingTab) {
      set({ activeTabId: tab.id });
    } else {
      set({
        tabs: [...tabs, { ...tab, closable: tab.closable !== false }],
        activeTabId: tab.id
      });
    }
  },
  
  closeTab: (tabId) => {
    const { tabs, activeTabId } = get();
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const tab = tabs[tabIndex];
    
    if (!tab || !tab.closable) return;
    
    const newTabs = tabs.filter(t => t.id !== tabId);
    
    let newActiveId = activeTabId;
    if (activeTabId === tabId) {
      // Switch to previous tab or first tab
      newActiveId = tabs[tabIndex - 1]?.id || tabs[tabIndex + 1]?.id || 'dashboard';
    }
    
    set({ tabs: newTabs, activeTabId: newActiveId });
  },
  
  switchTab: (tabId) => {
    set({ activeTabId: tabId });
  },
  
  updateTabProps: (tabId, props) => {
    set({
      tabs: get().tabs.map(t => 
        t.id === tabId ? { ...t, props: { ...t.props, ...props } } : t
      )
    });
  }
}));

export default useTabStore;
