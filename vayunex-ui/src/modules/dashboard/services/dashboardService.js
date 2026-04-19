// src/modules/dashboard/services/dashboardService.js
// Dashboard related service functions

import itemsData from '../../../data/items.json';
import categoriesData from '../../../data/categories.json';

/**
 * Get dashboard statistics and chart data
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const getDashboardStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  const totalItems = itemsData.length;
  const lowStockItems = itemsData.filter(item => item.quantity <= item.reorder_level).length;
  const totalCategories = categoriesData.length;
  const totalValue = itemsData.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const healthyItems = totalItems - lowStockItems;
  const stockHealthPercent = totalItems > 0 ? Math.round((healthyItems / totalItems) * 100) : 0;
  
  // Calculate Category Distribution for Pie Chart
  const categoryCount = {};
  itemsData.forEach(item => {
      const catName = categoriesData.find(c => c.id === item.category_id)?.category_name || "Uncategorized";
      categoryCount[catName] = (categoryCount[catName] || 0) + 1;
  });
  const categoryData = Object.keys(categoryCount).map(key => ({
      name: key,
      value: categoryCount[key]
  })).sort((a,b) => b.value - a.value).slice(0, 5); // Top 5 categories

  // Generate Mock Trend Data (Last 6 Months) for Area Chart
  const trendData = [
      { name: 'Oct', value: totalValue * 0.8, items: totalItems - 10 },
      { name: 'Nov', value: totalValue * 0.85, items: totalItems - 5 },
      { name: 'Dec', value: totalValue * 0.95, items: totalItems - 2 },
      { name: 'Jan', value: totalValue * 0.9, items: totalItems - 3 },
      { name: 'Feb', value: totalValue * 1.05, items: totalItems + 4 },
      { name: 'Mar', value: totalValue, items: totalItems }
  ];
  
  return {
    success: true,
    data: {
      totalItems,
      lowStockItems,
      totalCategories,
      totalValue,
      stockHealthPercent,
      healthyItems,
      categoryData,
      trendData
    }
  };
};

/**
 * Get recent items for dashboard
 * @param {number} limit 
 * @returns {Promise<{success: boolean, data: array}>}
 */
export const getRecentItems = async (limit = 10) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const items = itemsData
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, limit);
  
  return {
    success: true,
    data: items
  };
};
