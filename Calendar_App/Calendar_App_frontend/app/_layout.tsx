import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ColorSchemeProvider } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/store/useAuthStore';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => { /* Ignore errors */ });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

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
  const router = useRouter();

  // Initialize app: auth status and other core services (if any)
  useEffect(() => {
    async function prepareApp() {
      try {
        await checkAuthStatus();
        // Add other async initializations here if needed (e.g., initializeStorage())
      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        setAppCoreServicesReady(true);
      }
    }
    prepareApp();
  }, [checkAuthStatus]);

  // Handle navigation and splash screen hiding once all loading is complete
  useEffect(() => {
    if ((!fontsLoaded && !fontError) || !appCoreServicesReady || isAuthLoading) {
      return; // Still loading, splash remains visible
    }

    // All prerequisites met, proceed with navigation
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }

    SplashScreen.hideAsync().catch((error) => {
      console.warn('SplashScreen.hideAsync error:', error);
    });

  }, [fontsLoaded, fontError, appCoreServicesReady, isAuthLoading, isAuthenticated, router]);

  // While critical assets are loading, render nothing (splash screen is visible)
  if ((!fontsLoaded && !fontError) || !appCoreServicesReady || isAuthLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ColorSchemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="event/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="event/create" options={{ presentation: 'modal' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </ColorSchemeProvider>
    </GestureHandlerRootView>
  );
}