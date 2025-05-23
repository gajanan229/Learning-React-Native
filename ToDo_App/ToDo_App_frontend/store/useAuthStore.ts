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
        try {
          const user = await fetchCurrentUserAPI(token);
          set({
            isAuthenticated: true,
            currentUser: user,
            authToken: token,
            isLoading: false,
          });
        } catch (networkError: any) {
          // If it's a timeout or network error, but we have a token, assume offline mode
          if (networkError.message?.includes('timeout') || networkError.message?.includes('reach server')) {
            console.warn('Network error during auth check, assuming logged in offline:', networkError.message);
            set({
              isAuthenticated: true,
              currentUser: null, // We'll fetch later when network is available
              authToken: token,
              isLoading: false,
              error: null, // Don't show error for network issues
            });
          } else {
            // Token is likely invalid, clear it
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            set({
              isAuthenticated: false,
              currentUser: null,
              authToken: null,
              isLoading: false,
              error: null, // Don't show error, just redirect to login
            });
          }
        }
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
      // Error with SecureStore or other issues
      console.error('Auth check error:', err);
      set({
        isAuthenticated: false,
        currentUser: null,
        authToken: null,
        error: null, // Don't show error, just redirect to login
        isLoading: false,
      });
    } 
  },
}));

// Optional: Call checkAuthStatus on store initialization if desired,
// though typically this is done in the root component of the app.
// useAuthStore.getState().checkAuthStatus(); 