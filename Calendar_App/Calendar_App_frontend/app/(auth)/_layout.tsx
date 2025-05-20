import React from 'react';
import { Stack } from 'expo-router';
// import { useAuthStore } from '@/store/useAuthStore'; // No longer needed here for redirection
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';

export default function AuthLayout() {
  // const isAuthenticated = useAuthStore(state => state.isAuthenticated); // Redirection handled by RootLayout

  // If the user is authenticated, redirect them away from auth screens
  // This redirection is now handled by RootLayout
  // if (isAuthenticated) {
  //   return <Redirect href="/(tabs)" />;
  // }

  const { colorScheme } = useColorScheme(); // Optional: for styling
  const currentColors = Colors[colorScheme]; // Get current theme colors

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: currentColors.background }, // Use themed background
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
} 