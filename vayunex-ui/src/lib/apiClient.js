// src/lib/apiClient.js
// Axios client configuration for backend API

import axios from 'axios';
import { AppUser } from './index';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = AppUser.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response) => {
        return response.data; // Return only data
    },
    (error) => {
        if (error.response) {
            // Server responded with error
            const { status, data } = error.response;
            
            if (status === 401) {
                // Unauthorized - clear user and redirect to login
                AppUser.clear();
                window.location.reload();
            }
            
            return Promise.reject(data.error || data.message || 'Request failed');
        } else if (error.request) {
            // Request made but no response
            return Promise.reject('No response from server');
        } else {
            // Error in request setup
            return Promise.reject(error.message);
        }
    }
);

export default apiClient;
