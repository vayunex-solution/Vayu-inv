import apiClient from '../../../lib/apiClient';

export const getCities = async (queryParams = new URLSearchParams()) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/cities?${queryParams.toString()}`);
        return {
            success: true,
            data: response.data || response || [],
            totalRecords: response.totalRecords || 0
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to fetch cities'
        };
    }
};

export const getCitiesForDropdown = async (stateId = '') => {
    try {
        const url = stateId 
            ? `/api/v1/inventory/cities/dropdown?state_id=${stateId}` 
            : '/api/v1/inventory/cities/dropdown';
        const response = await apiClient.get(url);
        return {
            success: true,
            data: response.data || response || []
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to fetch cities for dropdown'
        };
    }
};

export const getCityById = async (id) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/cities/${id}`);
        return { success: true, data: response.data || response };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to fetch city details'
        };
    }
};

export const createCity = async (cityData) => {
    try {
        const response = await apiClient.post('/api/v1/inventory/cities', cityData);
        return { success: true, data: response.data || response, message: 'City created successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to create city'
        };
    }
};

export const updateCity = async (id, cityData) => {
    try {
        const response = await apiClient.put(`/api/v1/inventory/cities/${id}`, cityData);
        return { success: true, data: response.data || response, message: 'City updated successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to update city'
        };
    }
};

export const deleteCity = async (id) => {
    try {
        const response = await apiClient.delete(`/api/v1/inventory/cities/${id}`);
        return { success: true, data: response.data || response, message: 'City deleted successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to delete city'
        };
    }
};
