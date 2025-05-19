import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore'; // Adjust path if needed
import colors from '@/constants/Colors'; // Adjust path if needed

export default function AuthLayout() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // If the user is authenticated, redirect them away from auth screens
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />; // Or your main app entry point
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.dark.background },
      }}
    />
  );
} 