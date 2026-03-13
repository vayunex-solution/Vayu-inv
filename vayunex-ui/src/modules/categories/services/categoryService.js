// src/modules/categories/services/categoryService.js
// Category related service functions using real API

import { apiClient } from '../../../lib';

/**
 * Get all categories
 * @returns {Promise<{success: boolean, data: array, error?: object}>}
 */
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/api/v1/inventory/categories');
    return {
      success: true,
      data: response.data?.data || []
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error.response?.data?.message || 'Failed to fetch categories' }
    };
  }
};

/**
 * Get single category by ID
 * @param {number} id 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const getCategoryById = async (id) => {
  try {
    const response = await apiClient.get(`/api/v1/inventory/categories/${id}`);
    return {
      success: true,
      data: response.data?.data
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error.response?.data?.message || 'Category not found' }
    };
  }
};

/**
 * Create new category
 * @param {object} categoryData 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/api/v1/inventory/categories', categoryData);
    return { success: true, data: response.data?.data };
  } catch (error) {
    return {
      success: false,
      error: { message: error.response?.data?.message || 'Failed to create category' }
    };
  }
};

/**
 * Update existing category
 * @param {number} id 
 * @param {object} categoryData 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await apiClient.put(`/api/v1/inventory/categories/${id}`, categoryData);
    return { success: true, data: response.data?.data };
  } catch (error) {
    return {
      success: false,
      error: { message: error.response?.data?.message || 'Failed to update category' }
    };
  }
};

/**
 * Delete category
 * @param {number} id 
 * @returns {Promise<{success: boolean, error?: object}>}
 */
export const deleteCategory = async (id) => {
  try {
    await apiClient.delete(`/api/v1/inventory/categories/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { message: error.response?.data?.message || 'Failed to delete category' }
    };
  }
};
