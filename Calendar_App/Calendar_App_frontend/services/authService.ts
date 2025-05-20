// services/authService.ts

// IMPORTANT: Replace this placeholder with your actual environment variable setup
// e.g., import { EXPO_PUBLIC_AUTH_BACKEND_URL } from \'@env\';
// or const EXPO_PUBLIC_AUTH_BACKEND_URL = Constants.expoConfig?.extra?.authBackendUrl;
const EXPO_PUBLIC_AUTH_BACKEND_URL = process.env.EXPO_PUBLIC_AUTH_BACKEND_URL; // Replace this line

export interface UserDetails {
  id: string; // Or number, matching your backend\'s user ID type
  email: string;
  username?: string;
  // Add any other relevant user fields returned by your auth backend
}

export interface AuthResponse {
  token: string;
  user: UserDetails;
}

/**
 * Registers a new user.
 * @param email User\'s email
 * @param password User\'s password
 * @param username Optional username
 * @returns Promise resolving to AuthResponse (token and user details)
 * @throws Error if registration fails
 */
export async function registerUserAPI(
  email: string,
  password: string,
  username?: string
): Promise<AuthResponse> {
  const endpoint = `${EXPO_PUBLIC_AUTH_BACKEND_URL}/auth/register`;
  const body: { email: string; password: string; username?: string } = {
    email,
    password,
  };
  if (username) {
    body.username = username;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If parsing error JSON fails, throw a generic error
      throw new Error(response.statusText || 'Registration failed. Could not parse error response.');
    }
    throw new Error(errorData?.message || 'Registration failed');
  }

  return response.json() as Promise<AuthResponse>;
}

/**
 * Logs in an existing user.
 * @param email User\'s email
 * @param password User\'s password
 * @returns Promise resolving to AuthResponse (token and user details)
 * @throws Error if login fails
 */
export async function loginUserAPI(
  email: string,
  password: string
): Promise<AuthResponse> {
  const endpoint = `${EXPO_PUBLIC_AUTH_BACKEND_URL}/auth/login`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      console.log(e);
      console.log(response);
      throw new Error(response.statusText || 'Login failed. Could not parse error response.');
    }
    throw new Error(errorData?.message || 'Login failed');
  }

  return response.json() as Promise<AuthResponse>;
}

/**
 * Fetches the current authenticated user\'s details using a token.
 * @param token JWT authentication token
 * @returns Promise resolving to UserDetails
 * @throws Error if fetching user fails or token is invalid
 */
export async function fetchCurrentUserAPI(token: string): Promise<UserDetails> {
  const endpoint = `${EXPO_PUBLIC_AUTH_BACKEND_URL}/auth/me`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // For 401, the body might be empty or not JSON
      if (response.status === 401) {
        throw new Error('Session expired or invalid');
      }
      throw new Error(response.statusText || 'Failed to fetch user. Could not parse error response.');
    }
    throw new Error(errorData?.message || 'Failed to fetch user details. Session may be invalid.');
  }

  return response.json() as Promise<UserDetails>;
} 