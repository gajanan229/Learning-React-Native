import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  // Use individual store subscriptions to avoid creating new objects
  const login = useAuthStore(state => state.login);
  const isLoading = useAuthStore(state => state.isLoading);
  const authError = useAuthStore(state => state.error);

  const handleLogin = async () => {
    setLocalError('');
    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required.');
      return;
    }

    try {
      await login(email, password);
      // Note: No navigation here - let the root layout handle navigation based on auth state
    } catch (apiError: any) {
      console.error('Login failed:', apiError.message);
      // Error is already set in authStore
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 24 }}>
      <View style={{ width: '100%', maxWidth: 400, alignItems: 'center', padding: 24, backgroundColor: '#1A1A1A', borderRadius: 12 }}>
        <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold', marginBottom: 8 }}>ChronoFold</Text>
        <Text style={{ color: '#A0A0A0', fontSize: 16, marginBottom: 32 }}>Welcome Back</Text>

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
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={authError && authError.toLowerCase().includes('password') ? authError : undefined}
          />
        </View>

        {authError && !authError.toLowerCase().includes('email') && !authError.toLowerCase().includes('password') && (
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
          title={isLoading ? 'Logging In...' : 'Login'}
          onPress={handleLogin}
          disabled={isLoading}
          className="mt-4 w-full"
          leftIcon={isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : undefined}
        />

        <View style={{ flexDirection: 'row', marginTop: 32, alignItems: 'center' }}>
          <Text style={{ color: '#A0A0A0', fontSize: 14 }}>Don't have an account? </Text>
          <Link href={'/(auth)/register'} asChild>
            <TouchableOpacity>
              <Text style={{ color: '#007AFF', fontSize: 14, fontWeight: '500' }}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
} 