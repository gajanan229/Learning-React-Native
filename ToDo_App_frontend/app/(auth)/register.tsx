import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  // Use individual store subscriptions to avoid creating new objects
  const register = useAuthStore(state => state.register);
  const isLoading = useAuthStore(state => state.isLoading);
  const authError = useAuthStore(state => state.error);

  const isValidEmail = (emailToTest: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToTest);
  };

  const handleRegister = async () => {
    setLocalError('');
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setLocalError('All fields are required.');
      return;
    }
    if (!isValidEmail(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (password.length < 1) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      await register(email, password, username);
      // Note: No navigation here - let the root layout handle navigation based on auth state
    } catch (apiError: any) {
      console.error('Registration failed:', apiError.message);
      // Error is already set in authStore
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 24 }}>
      <View style={{ width: '100%', maxWidth: 400, alignItems: 'center', padding: 24, backgroundColor: '#1A1A1A', borderRadius: 12 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Create Account</Text>
        <Text style={{ color: '#A0A0A0', fontSize: 16, marginBottom: 32 }}>Join ChronoFold Today</Text>

        <View style={{ marginBottom: 16, width: '100%' }}>
          <TextField
            label="Username"
            placeholder="Choose a username"
            value={username}
            onChangeText={setUsername}
            error={authError && authError.toLowerCase().includes('username') ? authError : undefined}
          />
        </View>

        <View style={{ marginBottom: 16, width: '100%' }}>
          <TextField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={authError && authError.toLowerCase().includes('email') ? authError : undefined}
          />
        </View>

        <View style={{ marginBottom: 16, width: '100%' }}>
          <TextField
            label="Password"
            placeholder="Create a password (min. 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={authError && authError.toLowerCase().includes('password') && !authError.toLowerCase().includes('match') ? authError : undefined}
          />
        </View>

        <View style={{ marginBottom: 16, width: '100%' }}>
          <TextField
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={authError && authError.toLowerCase().includes('match') ? authError : undefined}
          />
        </View>

        {authError && 
          !authError.toLowerCase().includes('username') && 
          !authError.toLowerCase().includes('email') && 
          !authError.toLowerCase().includes('password') && 
          !authError.toLowerCase().includes('match') && (
          <Text style={{ color: '#FF3B30', fontSize: 14, textAlign: 'center', marginBottom: 16, width: '100%' }}>
            {authError}
          </Text>
        )}
        {localError && (
          <Text style={{ color: '#FF3B30', fontSize: 14, textAlign: 'center', marginBottom: 16, width: '100%' }}>
            {localError}
          </Text>
        )}

        <Button
          title={isLoading ? 'Creating Account...' : 'Sign Up'}
          onPress={handleRegister}
          disabled={isLoading}
          className="mt-4 w-full"
          leftIcon={isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : undefined}
        />

        <View style={{ flexDirection: 'row', marginTop: 32, alignItems: 'center' }}>
          <Text style={{ color: '#A0A0A0', fontSize: 14 }}>Already have an account? </Text>
          <Link href={'/(auth)/login'} asChild>
            <TouchableOpacity>
              <Text style={{ color: '#007AFF', fontSize: 14, fontWeight: '500' }}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
} 