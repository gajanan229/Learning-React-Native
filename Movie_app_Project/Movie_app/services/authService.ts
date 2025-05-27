const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_AUTH_URL 
console.log(BACKEND_BASE_URL);

// Define expected response structures
export interface User {
    id: number;
    email: string;
    username?: string;
    created_at: string;
    // Add other fields your /me endpoint or user object might have
}

export interface AuthResponse {
    token: string;
    user: User;
}

export const loginUserAPI = async (email: string, password: string): Promise<AuthResponse> => {
    console.log(BACKEND_BASE_URL);
    const response = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    }
    return response.json();
};

export const registerUserAPI = async (email: string, password: string, username?: string): Promise<AuthResponse> => {
    const response = await fetch(`${BACKEND_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
    }
    return response.json();
};

export const fetchCurrentUserAPI = async (token: string): Promise<User> => {
    if (!token) {
        throw new Error('No token provided for fetching current user');
    }

    const response = await fetch(`${BACKEND_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
            throw new Error(errorData.message || 'User not authenticated');
        }
        throw new Error(errorData.message || 'Failed to fetch current user');
    }
    // The /me endpoint in the backend directly returns the user object
    return response.json();
}; 