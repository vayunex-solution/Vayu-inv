import apiClient from '../../../lib/apiClient';

export const getDistricts = async (queryParams = new URLSearchParams()) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/districts?${queryParams.toString()}`);
        return {
            success: true,
            data: response.data || response || [],
            totalRecords: response.totalRecords || 0
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to fetch districts'
        };
    }
};

export const getDistrictsForDropdown = async (stateId = '') => {
    try {
        const url = stateId 
            ? `/api/v1/inventory/districts/dropdown?state_id=${stateId}` 
            : '/api/v1/inventory/districts/dropdown';
        const response = await apiClient.get(url);
        return {
            success: true,
            data: response.data || response || []
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to fetch districts for dropdown'
        };
    }
};

export const getDistrictById = async (id) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/districts/${id}`);
        return { success: true, data: response.data || response };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to fetch district details'
        };
    }
};

export const createDistrict = async (districtData) => {
    try {
        const response = await apiClient.post('/api/v1/inventory/districts', districtData);
        return { success: true, data: response.data || response, message: 'District created successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to create district'
        };
    }
};

export const updateDistrict = async (id, districtData) => {
    try {
        const response = await apiClient.put(`/api/v1/inventory/districts/${id}`, districtData);
        return { success: true, data: response.data || response, message: 'District updated successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to update district'
        };
    }
};

export const deleteDistrict = async (id) => {
    try {
        const response = await apiClient.delete(`/api/v1/inventory/districts/${id}`);
        return { success: true, data: response.data || response, message: 'District deleted successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to delete district'
        };
    }
};
