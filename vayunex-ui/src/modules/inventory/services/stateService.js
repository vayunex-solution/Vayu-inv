// src/modules/inventory/services/stateService.js
// State related service functions using real API

import { apiClient } from '../../../lib';

/**
 * Get all states, optionally filtered by country
 */
export const getStates = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.country_id) queryParams.append('country_id', params.country_id);
        if (params.search) queryParams.append('search', params.search);

        const response = await apiClient.get(`/api/v1/inventory/states?${queryParams.toString()}`);
        return {
            success: true,
            data: response.data || response || [],
            totalRecords: response.totalRecords || 0
        };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to fetch states' }
        };
    }
};

/**
 * Get states dropdown list filtered by country
 */
export const getStatesDropdown = async (countryId = 0) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/states/dropdown?country_id=${countryId}`);
        return {
            success: true,
            data: response.data || response || []
        };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to fetch states dropdown' }
        };
    }
};

/**
 * Get single state by ID
 */
export const getStateById = async (id) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/states/${id}`);
        return { success: true, data: response.data || response };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'State not found' }
        };
    }
};

/**
 * Create new state
 */
export const createState = async (stateData) => {
    try {
        const response = await apiClient.post('/api/v1/inventory/states', stateData);
        return { success: true, data: response.data?.data };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to create state' }
        };
    }
};

/**
 * Update existing state
 */
export const updateState = async (id, stateData) => {
    try {
        const response = await apiClient.put(`/api/v1/inventory/states/${id}`, stateData);
        return { success: true, data: response.data?.data };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to update state' }
        };
    }
};

/**
 * Delete state
 */
export const deleteState = async (id) => {
    try {
        await apiClient.delete(`/api/v1/inventory/states/${id}`);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: { message: error.response?.data?.message || 'Failed to delete state' }
        };
    }
};
