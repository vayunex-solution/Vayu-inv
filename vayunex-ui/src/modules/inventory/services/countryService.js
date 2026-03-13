// src/modules/inventory/services/countryService.js
// Country related service functions using real API

import { apiClient } from '../../../lib';

/**
 * Get all countries with pagination and filtering
 * @param {object} params - Search, pagination and filter parameters
 * @returns {Promise<{success: boolean, data: object, error?: object}>}
 */
export const getCountries = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sortBy', params.sort_by);
        if (params.sort_order) queryParams.append('sortOrder', params.sort_order);

        const response = await apiClient.get(`/api/v1/inventory/countries?${queryParams.toString()}`);
        return {
            success: true,
            data: response.data?.data || { items: [], pagination: {} } 
        };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to fetch countries' }
        };
    }
};

/**
 * Get countries dropdown list
 * @returns {Promise<{success: boolean, data: array, error?: object}>}
 */
export const getCountriesDropdown = async () => {
    try {
        const response = await apiClient.get('/api/v1/inventory/countries/dropdown');
        return {
            success: true,
            data: response.data?.data || []
        };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to fetch countries dropdown' }
        };
    }
};

/**
 * Get single country by ID
 * @param {number} id 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const getCountryById = async (id) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/countries/${id}`);
        return {
            success: true,
            data: response.data?.data
        };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Country not found' }
        };
    }
};

/**
 * Create new country
 * @param {object} countryData 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const createCountry = async (countryData) => {
    try {
        const response = await apiClient.post('/api/v1/inventory/countries', countryData);
        return { success: true, data: response.data?.data };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to create country' }
        };
    }
};

/**
 * Update existing country
 * @param {number} id 
 * @param {object} countryData 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const updateCountry = async (id, countryData) => {
    try {
        const response = await apiClient.put(`/api/v1/inventory/countries/${id}`, countryData);
        return { success: true, data: response.data?.data };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to update country' }
        };
    }
};

/**
 * Delete country
 * @param {number} id 
 * @returns {Promise<{success: boolean, error?: object}>}
 */
export const deleteCountry = async (id) => {
    try {
        await apiClient.delete(`/api/v1/inventory/countries/${id}`);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to delete country' }
        };
    }
};
