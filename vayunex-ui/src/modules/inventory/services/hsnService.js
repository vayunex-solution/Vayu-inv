// src/modules/inventory/services/hsnService.js
import { apiClient } from '../../../lib';

/**
 * Get all HSN codes (full list with description, tax rate)
 */
export const getHsnList = async () => {
    try {
        const response = await apiClient.get('/api/v1/inventory/hsn');
        const data = Array.isArray(response.data) ? response.data : (response.data || []);
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: { message: typeof error === 'string' ? error : 'Failed to fetch HSN list' }
        };
    }
};

/**
 * Get HSN dropdown list (code + description for select inputs)
 */
export const getHsnDropdown = async () => {
    try {
        const response = await apiClient.get('/api/v1/inventory/hsn/dropdown');
        const data = Array.isArray(response.data) ? response.data : (response.data || []);
        return { success: true, data };
    } catch (error) {
        // Fallback to full list if dropdown endpoint not available
        return getHsnList();
    }
};

/**
 * Get a single HSN by ID
 * @param {number} id
 */
export const getHsnById = async (id) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/hsn/${id}`);
        return { success: true, data: response.data || response };
    } catch (error) {
        return {
            success: false,
            error: { message: typeof error === 'string' ? error : 'Failed to fetch HSN' }
        };
    }
};

/**
 * Create a new HSN code
 * @param {object} data - { hsn_code, description, tax_rate }
 */
export const createHsn = async (data) => {
    try {
        const response = await apiClient.post('/api/v1/inventory/hsn', data);
        return { success: true, data: response.data || response };
    } catch (error) {
        return {
            success: false,
            error: { message: typeof error === 'string' ? error : 'Failed to create HSN' }
        };
    }
};

/**
 * Update an HSN code
 * @param {number} id
 * @param {object} data
 */
export const updateHsn = async (id, data) => {
    try {
        const response = await apiClient.put(`/api/v1/inventory/hsn/${id}`, data);
        return { success: true, data: response.data || response };
    } catch (error) {
        return {
            success: false,
            error: { message: typeof error === 'string' ? error : 'Failed to update HSN' }
        };
    }
};

/**
 * Delete an HSN code (soft delete)
 * @param {number} id
 */
export const deleteHsn = async (id) => {
    try {
        await apiClient.delete(`/api/v1/inventory/hsn/${id}`);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: { message: typeof error === 'string' ? error : 'Failed to delete HSN' }
        };
    }
};

/**
 * Get items by HSN code
 * @param {string} hsn_code
 */
export const getItemsByHsnCode = async (hsn_code) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/hsn/${hsn_code}/items`);
        const data = Array.isArray(response.data) ? response.data : (response.data || []);
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: { message: typeof error === 'string' ? error : 'Failed to fetch items for HSN' }
        };
    }
};
