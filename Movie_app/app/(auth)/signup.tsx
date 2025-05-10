import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Corrected path
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { signup, isLoading } = useAuth();

    const handleSignup = async () => {
        setError(null);
        if (!email || !password || !username || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        // Basic email validation regex (consider a more robust one or a library)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            const success = await signup(email, password, username);
            if (!success) {
                setError('Signup failed. Please try again.');
                 // More specific error could be set if AuthContext provided it
            }
            // Navigation handled by RootLayout
        } catch (err) {
            setError('An unexpected error occurred during signup.');
            console.error('Signup screen error:', err);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-primary justify-center items-center p-6">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ width: '100%', maxWidth: 448 }} // max-w-md equivalent
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text className="text-3xl font-bold text-white text-center mb-8">Create Account</Text>

                    {error && (
                        <Text className="text-red-500 text-center mb-4">{error}</Text>
                    )}

                    <TextInput
                        className="bg-gray-800 text-white rounded-lg p-4 mb-4 w-full border border-gray-700 focus:border-secondary"
                        placeholder="Username"
                        placeholderTextColor="#9CA3AF"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

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
                        className="bg-gray-800 text-white rounded-lg p-4 mb-4 w-full border border-gray-700 focus:border-secondary"
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TextInput
                        className="bg-gray-800 text-white rounded-lg p-4 mb-6 w-full border border-gray-700 focus:border-secondary"
                        placeholder="Confirm Password"
                        placeholderTextColor="#9CA3AF"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        className={`bg-secondary rounded-lg p-4 w-full items-center ${isLoading ? 'opacity-50' : ''}`}
                        onPress={handleSignup}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text className="text-white text-lg font-semibold">Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)} className="mt-6 mb-4">
                        <Text className="text-gray-400 text-center">
                            Already have an account? <Text className="text-secondary font-semibold">Login</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 