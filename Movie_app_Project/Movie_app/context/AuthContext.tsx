import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
    loginUserAPI,
    registerUserAPI,
    fetchCurrentUserAPI,
    AuthResponse,
    User
} from '../services/authService';

// Define the shape of the authentication state
interface AuthState {
    isAuthenticated: boolean;
    userToken: string | null;
    currentUser: User | null;
    isLoading: boolean;
}

// Define the shape of the context value (state + actions)
// We'll add actions like login, logout, signup later
interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<User | false>;
    signup: (email: string, password: string, username?: string) => Promise<User | false>;
    logout: () => Promise<void>;
    checkAuthState: () => Promise<void>;
}

// Create the context with a default undefined value to catch improper usage
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // True initially for checkAuthState later

    const logout = async (comingFromCheckAuth: boolean = false): Promise<void> => {
        if(!comingFromCheckAuth) setIsLoading(true);
        try {
            await SecureStore.deleteItemAsync('userToken');
        } catch (error) {
            console.error('Failed to delete token from SecureStore during logout:', error);
        }
        setUserToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        if(!comingFromCheckAuth) setIsLoading(false);
    };

    const checkAuthState = async (): Promise<void> => {
        setIsLoading(true); // Ensure loading is true at the start of this check
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                // Token exists, try to validate it by fetching current user
                const user = await fetchCurrentUserAPI(token);
                setUserToken(token);
                setCurrentUser(user);
                setIsAuthenticated(true);
            } else {
                // No token, ensure user is logged out
                // This call to logout will just reset state, as token is already null
                await logout(true); // Pass true to avoid redundant setIsLoading
            }
        } catch (error) {
            console.error('Check auth state failed (likely invalid/expired token):', error);
            await logout(true); // If token validation fails, logout user
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuthState();
    }, []);

    const login = async (email: string, password: string): Promise<User | false> => {
        setIsLoading(true);
        try {
            const data: AuthResponse = await loginUserAPI(email, password);
            await SecureStore.setItemAsync('userToken', data.token);
            setUserToken(data.token);
            setCurrentUser(data.user);
            setIsAuthenticated(true);
            return data.user;
        } catch (error) {
            console.error('Login failed in AuthContext:', error);
            // Ensure state is reset on login failure
            await logout(true); // Use logout to ensure clean state, pass true
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (email: string, password: string, username?: string): Promise<User | false> => {
        setIsLoading(true);
        try {
            const data: AuthResponse = await registerUserAPI(email, password, username);
            await SecureStore.setItemAsync('userToken', data.token);
            setUserToken(data.token);
            setCurrentUser(data.user);
            setIsAuthenticated(true);
            return data.user;
        } catch (error) {
            console.error('Signup failed in AuthContext:', error);
            await logout(true); // Use logout to ensure clean state, pass true
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            userToken,
            currentUser,
            isLoading,
            login,
            signup,
            logout,
            checkAuthState
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 