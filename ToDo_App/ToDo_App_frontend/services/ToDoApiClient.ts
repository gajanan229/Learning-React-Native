import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'; 
import { useAuthStore } from '@/store/useAuthStore';

// Base URL for the TODO backend
const BASE_URL = process.env.EXPO_PUBLIC_TODO_BACKEND_URL || 'http://localhost:3002/api';

// Create axios instance
const todoApiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
todoApiClient.interceptors.request.use(
  (config) => {
    // Get the current auth token from the store
    const authState = useAuthStore.getState();
    const token = authState.authToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (__DEV__) {
      console.log(`[TODO API] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[TODO API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and data unwrapping
todoApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (__DEV__) {
      console.log(`[TODO API] Response:`, response.data);
    }
    
    // The backend wraps responses in { success, message, data }
    // We'll return the whole response but the services can access .data
    return response;
  },
  (error: AxiosError) => {
    // Log error in development
    if (__DEV__) {
      console.error('[TODO API] Response error:', error.response?.data || error.message);
    }
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      console.warn('[TODO API] Unauthorized access, redirecting to login');
      const authState = useAuthStore.getState();
      authState.logout(); // This should handle navigation to login
    }
    
    if (error.response?.status === 403) {
      // Forbidden
      console.warn('[TODO API] Forbidden access');
    }
    
    if (error.response?.status === 404) {
      // Not found
      console.warn('[TODO API] Resource not found');
    }
    
    if (error.response && error.response.status >= 500) {
      // Server error
      console.error('[TODO API] Server error');
    }
    
    // Network error
    if (!error.response) {
      console.error('[TODO API] Network error - check connection');
    }
    
    return Promise.reject(error);
  }
);

export default todoApiClient; 