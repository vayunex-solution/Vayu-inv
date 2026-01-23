// src/modules/categories/services/categoryService.js
// Category related service functions

import categoriesData from '../../../data/categories.json';

/**
 * Get all categories
 * @returns {Promise<{success: boolean, data: array}>}
 */
export const getCategories = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { success: true, data: categoriesData };
};

/**
 * Get single category by ID
 * @param {number} id 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const getCategoryById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const category = categoriesData.find(c => c.id === id);
  
  if (category) {
    return { success: true, data: category };
  }
  
  return {
    success: false,
    error: { message: 'Category not found' }
  };
};

/**
 * Create new category
 * @param {object} categoryData 
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const createCategory = async (categoryData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newCategory = {
    id: Date.now(),
    ...categoryData,
    created_at: new Date().toISOString()
  };
  
  return { success: true, data: newCategory };
};

/**
 * Update existing category
 * @param {number} id 
 * @param {object} categoryData 
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const updateCategory = async (id, categoryData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: { id, ...categoryData }
  };
};

/**
 * Delete category
 * @param {number} id 
 * @returns {Promise<{success: boolean}>}
 */
export const deleteCategory = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true };
};
