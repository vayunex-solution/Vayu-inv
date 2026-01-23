// src/modules/dashboard/services/dashboardService.js
// Dashboard related service functions

import itemsData from '../../../data/items.json';
import categoriesData from '../../../data/categories.json';

/**
 * Get dashboard statistics
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const getDashboardStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const totalItems = itemsData.length;
  const lowStockItems = itemsData.filter(item => item.quantity <= item.reorder_level).length;
  const totalCategories = categoriesData.length;
  const totalValue = itemsData.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  
  return {
    success: true,
    data: {
      totalItems,
      lowStockItems,
      totalCategories,
      totalValue
    }
  };
};

/**
 * Get recent items for dashboard
 * @param {number} limit 
 * @returns {Promise<{success: boolean, data: array}>}
 */
export const getRecentItems = async (limit = 5) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const items = itemsData
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, limit);
  
  return {
    success: true,
    data: items
  };
};
