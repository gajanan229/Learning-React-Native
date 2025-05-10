import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Corrected path
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, isLoading } = useAuth();

    const handleLogin = async () => {
        setError(null); // Clear previous errors
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        try {
            const success = await login(email, password);
            if (!success) {
                // Error message is set by AuthContext or derived if needed
                setError('Login failed. Please check your credentials.');
            }
            // Navigation is handled by RootLayout based on isAuthenticated state
        } catch (err) {
            // This catch block might be redundant if AuthContext handles errors internally
            // and login function doesn't re-throw.
            setError('An unexpected error occurred. Please try again.');
            console.error('Login screen error:', err);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-primary justify-center items-center p-6">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="w-full max-w-md"
            >
                <Text className="text-3xl font-bold text-white text-center mb-8">Login</Text>

                {error && (
                    <Text className="text-red-500 text-center mb-4">{error}</Text>
                )}

                <TextInput
                    className="bg-gray-800 text-white rounded-lg p-4 mb-4 w-full border border-gray-700 focus:border-secondary"
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    className="bg-gray-800 text-white rounded-lg p-4 mb-6 w-full border border-gray-700 focus:border-secondary"
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    className={`bg-secondary rounded-lg p-4 w-full items-center ${isLoading ? 'opacity-50' : ''}`}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text className="text-white text-lg font-semibold">Login</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/signup' as any)} className="mt-6">
                    <Text className="text-gray-400 text-center">
                        Don't have an account? <Text className="text-secondary font-semibold">Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 