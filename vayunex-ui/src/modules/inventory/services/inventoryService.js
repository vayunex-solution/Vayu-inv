// src/modules/inventory/services/inventoryService.js
// Inventory related service functions using real API

import { apiClient } from '../../../lib';

/**
 * Get all items with pagination and filtering
 * Note: apiClient interceptor automatically appends fy_id to GET params
 * and X-FY-ID header, so no need to pass fy_id explicitly here.
 * @param {object} params - Search, pagination and filter parameters
 * @returns {Promise<{success: boolean, data: object, error?: object}>}
 */
export const getItems = async (params = {}) => {
    try {
        const queryParams = {};
        if (params.page) queryParams.page = params.page;
        if (params.limit) queryParams.limit = params.limit;
        if (params.search) queryParams.search = params.search;
        if (params.category_id) queryParams.category_id = params.category_id;
        if (params.sort_by) queryParams.sort_by = params.sort_by;
        if (params.sort_order) queryParams.sort_order = params.sort_order;
        if (params.hsn_code) queryParams.hsn_code = params.hsn_code;
        // fy_id is auto-injected by apiClient interceptor

        // response is already response.data (axios interceptor strips wrapper)
        const response = await apiClient.get('/api/v1/inventory/items', { params: queryParams });

        // API response shape: { success, message, data: [...], pagination: { page, limit, total, totalPages } }
        const items = Array.isArray(response.data) ? response.data : (response.data?.items || []);
        const pagination = response.pagination || response.data?.pagination || { page: 1, limit: 10, total: 0 };

        return {
            success: true,
            data: {
                items,
                pagination
            }
        };
    } catch (error) {
        return {
            success: false,
            error: { message: typeof error === 'string' ? error : error?.message || 'Failed to fetch items' }
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
            data: response.data || response
        };
    } catch (error) {
        return {
            success: false,
            error: { message: typeof error === 'string' ? error : 'Item not found' }
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
        return { success: true, data: response.data || response };
    } catch (error) {
        return {
            success: false,
            error: { message: typeof error === 'string' ? error : 'Failed to create item' }
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
        return { success: true, data: response.data || response };
    } catch (error) {
        return {
            success: false,
            error: { message: typeof error === 'string' ? error : 'Failed to update item' }
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
            error: { message: typeof error === 'string' ? error : 'Failed to delete item' }
        };
    }
};

/**
 * Get item categories
 * @returns {Promise<{success: boolean, data?: Array, error?: object}>}
 */
export const getItemCategories = async () => {
    try {
        const response = await apiClient.get('/api/v1/inventory/item-categories');
        const data = Array.isArray(response.data) ? response.data : (response.data || response || []);
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: { message: typeof error === 'string' ? error : 'Failed to fetch categories' }
        };
    }
};
