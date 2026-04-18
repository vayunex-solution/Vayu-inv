// src/lib/FyStore.js
// Global financial year selection store (Zustand)

import { create } from 'zustand';
import { getFysForDropdown } from '../modules/inventory/services/fyService';

const STORAGE_KEY = 'vayunex_selected_fy';

const useFyStore = create((set, get) => ({
  fys: [],
  selectedFyId: localStorage.getItem(STORAGE_KEY) || '',

  loadFys: async () => {
    try {
      const res = await getFysForDropdown();
      const list = res?.data || res || [];
      set({ fys: list });

      // Auto-select: strictly prefer Current FY. Fallback to stored, then first item.
      const current = list.find(f => f.IsCurrentFy === 'Y' || f.ISCURRENTFY === 'Y' || f.is_current_fy === 'Y');
      const stored = localStorage.getItem(STORAGE_KEY);
      const fallback = list[0];
      
      let nextId = current ? String(current.FYID || current.FyId || current.fy_id) : null;
      
      // If no current FY is defined, fallback to stored
      if (!nextId && stored && list.find(f => String(f.FYID || f.FyId || f.fy_id) === stored)) {
        nextId = stored;
      }
      // If still no ID, fallback to first item
      if (!nextId && fallback) {
        nextId = String(fallback.FYID || fallback.FyId || fallback.fy_id);
      }

      if (nextId) {
        set({ selectedFyId: nextId });
        localStorage.setItem(STORAGE_KEY, nextId);
      }
    } catch (err) {
      console.error('Failed to load FY list', err);
    }
  },

  setSelectedFy: (id) => {
    set({ selectedFyId: id });
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  },
}));

export default useFyStore;
