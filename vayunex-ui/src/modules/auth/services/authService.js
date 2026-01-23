// src/modules/auth/services/authService.js
// Authentication related service functions using real backend API

import { apiClient } from '../../../lib';

/**
 * Authenticate user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/api/v1/auth/login', {
      email,
      password
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: { message: typeof error === 'string' ? error : error.message || 'Login failed' }
    };
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/api/v1/auth/register', userData);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: { message: typeof error === 'string' ? error : error.message || 'Registration failed' }
    };
  }
};

/**
 * Logout user
 * @returns {Promise<{success: boolean}>}
 */
export const logout = async () => {
  return { success: true };
};
