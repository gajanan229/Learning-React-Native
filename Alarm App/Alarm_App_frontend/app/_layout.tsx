import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { initializeStorage } from '@/utils/storage';
import { configureNotifications } from '@/utils/notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/store/useAuthStore';
import { colors } from '@/constants/theme';

// Prevent auto-hide for all platforms to ensure consistent behavior
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Ignore errors */
});

export default function RootLayout() {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    checkAuthStatus,
  } = useAuthStore(state => ({
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    checkAuthStatus: state.checkAuthStatus,
  }));
  
  const [appCoreServicesReady, setAppCoreServicesReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium, 
    'Inter-Bold': Inter_700Bold,
  });

  // Initialize app: storage, notifications, and then check auth status
  useEffect(() => {
    async function prepareApp() {
      try {
        await initializeStorage();
        await configureNotifications();
        await checkAuthStatus(); // Ensure auth status is checked before marking core services ready
      } catch (e) {
        console.warn('Error during app preparation:', e);
        // Still mark as ready to allow app to proceed or show error state if necessary
      } finally {
        setAppCoreServicesReady(true);
      }
    }
    prepareApp();
  }, [checkAuthStatus]); // checkAuthStatus is stable, effect runs once on mount

  const router = useRouter();

  // Handle navigation and splash screen hiding once all loading is complete
  useEffect(() => {
    // Conditions to wait: fonts not loaded OR core services not ready OR auth still loading
    if ((!fontsLoaded && !fontError) || !appCoreServicesReady || isAuthLoading) {
      return; // Still loading, splash remains visible, do nothing further
    }

    // All prerequisites met, proceed with navigation
    if (isAuthenticated) {
      router.replace('/(tabs)'); // Navigate to main app content
    } else {
      router.replace('/(auth)/login'); // Navigate to login
    }

    // Hide splash screen AFTER navigation decision is made and likely initiated
    SplashScreen.hideAsync().catch((error) => {
      console.warn('SplashScreen.hideAsync error:', error);
    });

  }, [fontsLoaded, fontError, appCoreServicesReady, isAuthLoading, isAuthenticated, router]);

  // While critical assets are loading, render nothing (splash screen is visible)
  if ((!fontsLoaded && !fontError) || !appCoreServicesReady || isAuthLoading) {
    return null;
  }

  // Render the main navigation structure
  // Expo Router will use the _layout.tsx files in (auth) and (tabs) directories
  // to render the content for those routes.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary }, // Use theme color
          animation: 'slide_from_right',
        }}
      >
        {/* Define available route groups. Expo Router handles rendering based on URL. */}
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        {/* Add <Stack.Screen name="+not-found" /> if you have a global not-found page */}
        {/* If you had an app/index.tsx for logged-in users not in a group, declare it here: */}
        {/* e.g. <Stack.Screen name="index" /> */}
      </Stack>
    </GestureHandlerRootView>
  );
}