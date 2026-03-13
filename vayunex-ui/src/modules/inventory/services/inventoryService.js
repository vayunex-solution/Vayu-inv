// src/modules/inventory/services/inventoryService.js
// Inventory related service functions using real API

import { apiClient } from '../../../lib';

/**
 * Get all items with pagination and filtering
 * @param {object} params - Search, pagination and filter parameters
 * @returns {Promise<{success: boolean, data: object, error?: object}>}
 */
export const getItems = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        if (params.category_id) queryParams.append('category_id', params.category_id);
        if (params.sort_by) queryParams.append('sortBy', params.sort_by);
        if (params.sort_order) queryParams.append('sortOrder', params.sort_order);

        const response = await apiClient.get(`/api/v1/inventory/items?${queryParams.toString()}`);
        return {
            success: true,
            data: response.data?.data || { items: [], pagination: {} } 
        };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to fetch items' }
        };
    }
};

/**
 * Get single item by ID
 * @param {number} id 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const getItemById = async (id) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/items/${id}`);
        return {
            success: true,
            data: response.data?.data
        };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Item not found' }
        };
    }
};

/**
 * Create new item
 * @param {object} itemData 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const createItem = async (itemData) => {
    try {
        const response = await apiClient.post('/api/v1/inventory/items', itemData);
        return { success: true, data: response.data?.data };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to create item' }
        };
    }
};

/**
 * Update existing item
 * @param {number} id 
 * @param {object} itemData 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const updateItem = async (id, itemData) => {
    try {
        const response = await apiClient.put(`/api/v1/inventory/items/${id}`, itemData);
        return { success: true, data: response.data?.data };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to update item' }
        };
    }
};

/**
 * Delete item
 * @param {number} id 
 * @returns {Promise<{success: boolean, error?: object}>}
 */
export const deleteItem = async (id) => {
    try {
        await apiClient.delete(`/api/v1/inventory/items/${id}`);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to delete item' }
        };
    }
};
