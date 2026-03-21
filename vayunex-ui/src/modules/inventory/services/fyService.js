import apiClient from '../../../lib/apiClient';

export const getFys = async (queryParams = new URLSearchParams()) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/fys?${queryParams.toString()}`);
        return {
            success: true,
            data: response.data || response || [],
            totalRecords: response.totalRecords || 0
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to fetch financial years'
        };
    }
};

export const getFysForDropdown = async () => {
    try {
        const response = await apiClient.get('/api/v1/inventory/fys/dropdown');
        return {
            success: true,
            data: response.data || response || []
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to fetch financial years for dropdown'
        };
    }
};

export const getFyById = async (id) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/fys/${id}`);
        return { success: true, data: response.data || response };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to fetch financial year details'
        };
    }
};

export const createFy = async (fyData) => {
    try {
        const response = await apiClient.post('/api/v1/inventory/fys', fyData);
        return { success: true, data: response.data || response, message: 'Financial Year created successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to create financial year'
        };
    }
};

export const updateFy = async (id, fyData) => {
    try {
        const response = await apiClient.put(`/api/v1/inventory/fys/${id}`, fyData);
        return { success: true, data: response.data || response, message: 'Financial Year updated successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to update financial year'
        };
    }
};

export const deleteFy = async (id) => {
    try {
        const response = await apiClient.delete(`/api/v1/inventory/fys/${id}`);
        return { success: true, data: response.data || response, message: 'Financial Year deleted successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to delete financial year'
        };
    }
};
