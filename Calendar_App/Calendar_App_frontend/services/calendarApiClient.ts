import axios, { AxiosError, AxiosResponse } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/useAuthStore'; // For potential logout on 401

// The EXPO_PUBLIC_ variables are available via process.env in Expo
const EXPO_PUBLIC_CALENDAR_BACKEND_URL = process.env.EXPO_PUBLIC_CALENDAR_BACKEND_URL;

if (!EXPO_PUBLIC_CALENDAR_BACKEND_URL) {
    console.error("CRITICAL: EXPO_PUBLIC_CALENDAR_BACKEND_URL is not defined. Please check your .env file and expo-env.d.ts");
}

const calendarApiClient = axios.create({
    baseURL: EXPO_PUBLIC_CALENDAR_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request Interceptor: Attaches JWT token to every request
calendarApiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            // Retrieve the token, ensuring consistency with how it's stored
            const token = await SecureStore.getItemAsync('userToken');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.error("Error retrieving token from SecureStore in interceptor:", e);
        }
        return config;
    },
    (error: AxiosError) => {
        console.error('Axios request interceptor error for Calendar API:', error.toJSON ? error.toJSON() : error);
        return Promise.reject(error);
    }
);

// Response Interceptor: Handles common API errors
calendarApiClient.interceptors.response.use(
    (response: AxiosResponse) => response, // Explicitly typed response
    (error: AxiosError) => {
        const { response } = error;
        if (response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(
                'Axios response error from Calendar API:', 
                JSON.stringify({ 
                    status: response.status, 
                    data: response.data,
                    message: error.message,
                    url: error.config?.url,
                    method: error.config?.method,
                }, null, 2)
            );

            if (response.status === 401) {
                // Unauthorized: Token might be invalid, expired, or not provided correctly
                // Trigger logout action from useAuthStore
                // This assumes useAuthStore is set up to handle global logout
                console.warn('Received 401 from Calendar API. Attempting to log out user.');
                // Ensure logout also clears SecureStore token
                useAuthStore.getState().logout(); 
            } else if (response.status === 403) {
                // Forbidden: User is authenticated but doesn't have permission
                console.warn('Received 403 Forbidden from Calendar API.');
                // You might want to show a specific message or redirect
            }
            // For other errors (400, 404, 500), the specific service function will typically handle them
            // by catching the error and processing it.
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.error('Axios response error from Calendar API: No response received.', error.request ? JSON.stringify(error.request) : error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Axios response error from Calendar API: Error setting up request.', error.message);
        }
        return Promise.reject(error); // Propagate error so service functions can catch it
    }
);

export default calendarApiClient; 