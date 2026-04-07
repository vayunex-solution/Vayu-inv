// src/modules/inventory/services/hsnService.js
import { apiClient } from '../../../lib';

export const getHsnList = async () => {
  try {
    const response = await apiClient.get('/api/v1/inventory/hsn');
    return { success: true, data: response.data || response || [] };
  } catch (error) {
    return {
      success: false,
      error: { message: error?.message || 'Failed to fetch HSN list' }
    };
  }
};

export const getItemsByHsnCode = async (code) => {
  try {
    const response = await apiClient.get(`/api/v1/inventory/hsn/${code}/items`);
    return { success: true, data: response.data || response || [] };
  } catch (error) {
    return {
      success: false,
      error: { message: error?.message || 'Failed to fetch items for HSN' }
    };
  }
};
