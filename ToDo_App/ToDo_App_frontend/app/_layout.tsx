import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppContextProvider } from '@/contexts/AppContext';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';

export default function RootLayout() {
  const [hasInitialized, setHasInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Use individual store subscriptions to avoid creating new objects
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const checkAuthStatus = useAuthStore(state => state.checkAuthStatus);

  useEffect(() => {
    // Initialize auth status only once
    if (!hasInitialized) {
      checkAuthStatus();
      setHasInitialized(true);
    }
  }, [hasInitialized, checkAuthStatus]);

  useEffect(() => {
    // Handle navigation based on auth state changes
    if (!hasInitialized || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inCreateGroup = segments[0] === 'Create';

    if (isAuthenticated && inAuthGroup) {
      // User is authenticated but still in auth screens, navigate to main app
      router.replace('/(tabs)');
    } else if (!isAuthenticated && inTabsGroup) {
      // User is not authenticated but in main app, navigate to auth
      router.replace('/(auth)/login');
    } else if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not in auth group, navigate to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && !inTabsGroup && !inAuthGroup && !inCreateGroup) {
      // User is authenticated but not in any known group, navigate to main app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, hasInitialized, isLoading, segments, router]);

  // Show loading screen while checking auth status
  if (!hasInitialized || isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppContextProvider>
        <View style={{ flex: 1, backgroundColor: '#121212' }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="Create" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" />
        </View>
      </AppContextProvider>
    </GestureHandlerRootView>
  );
}