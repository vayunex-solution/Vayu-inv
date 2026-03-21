import apiClient from '../../../lib/apiClient';

export const getBrands = async (queryParams = new URLSearchParams()) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/brands?${queryParams.toString()}`);
        return {
            success: true,
            data: response.data || response || [],
            totalRecords: response.totalRecords || 0
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to fetch brands'
        };
    }
};

export const getBrandsForDropdown = async () => {
    try {
        const response = await apiClient.get('/api/v1/inventory/brands/dropdown');
        return {
            success: true,
            data: response.data || response || []
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to fetch brands for dropdown'
        };
    }
};

export const getBrandById = async (id) => {
    try {
        const response = await apiClient.get(`/api/v1/inventory/brands/${id}`);
        return { success: true, data: response.data || response };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to fetch brand details'
        };
    }
};

export const createBrand = async (brandData) => {
    try {
        const response = await apiClient.post('/api/v1/inventory/brands', brandData);
        return { success: true, data: response.data || response, message: 'Brand created successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to create brand'
        };
    }
};

export const updateBrand = async (id, brandData) => {
    try {
        const response = await apiClient.put(`/api/v1/inventory/brands/${id}`, brandData);
        return { success: true, data: response.data || response, message: 'Brand updated successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to update brand'
        };
    }
};

export const deleteBrand = async (id) => {
    try {
        const response = await apiClient.delete(`/api/v1/inventory/brands/${id}`);
        return { success: true, data: response.data || response, message: 'Brand deleted successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to delete brand'
        };
    }
};
