import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import {
  registerUserAPI,
  loginUserAPI,
  fetchCurrentUserAPI,
  UserDetails, // Assuming UserDetails is exported from authService or a types file
  AuthResponse,
} from '../services/authService';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserDetails | null;
  authToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const TOKEN_KEY = 'userToken';

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial State
  isAuthenticated: false,
  currentUser: null,
  authToken: null,
  isLoading: true, // Start with true for initial checkAuthStatus
  error: null,

  // Login Action
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await loginUserAPI(email, password);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      set({
        isAuthenticated: true,
        currentUser: user,
        authToken: token,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage = (err as Error).message || 'Login failed. Please try again.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage); // Re-throw for UI components to handle if needed
    }
  },

  // Register Action
  register: async (email, password, username) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await registerUserAPI(email, password, username);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      set({
        isAuthenticated: true,
        currentUser: user,
        authToken: token,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage = (err as Error).message || 'Registration failed. Please try again.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage); // Re-throw
    }
  },

  // Logout Action
  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({
      isAuthenticated: false,
      currentUser: null,
      authToken: null,
      error: null, // Clear any previous errors on logout
      isLoading: false, // Ensure loading is false after logout
    });
  },

  // Check Authentication Status Action
  checkAuthStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        // Validate token by fetching current user
        const user = await fetchCurrentUserAPI(token);
        set({
          isAuthenticated: true,
          currentUser: user,
          authToken: token,
          isLoading: false,
        });
      } else {
        // No token found, ensure user is logged out
        set({
          isAuthenticated: false,
          currentUser: null,
          authToken: null,
          isLoading: false,
        });
      }
    } catch (err: any) { 
      // Error likely means token is invalid or network issue
      await SecureStore.deleteItemAsync(TOKEN_KEY); // Clear potentially bad token
      set({
        isAuthenticated: false,
        currentUser: null,
        authToken: null,
        error: (err as Error).message || 'Session check failed. Please log in again.',
        isLoading: false,
      });
    } 
    // Removed redundant finally block as isLoading is set in all paths
  },
}));

// Optional: Call checkAuthStatus on store initialization if desired,
// though typically this is done in the root component of the app.
// useAuthStore.getState().checkAuthStatus(); 