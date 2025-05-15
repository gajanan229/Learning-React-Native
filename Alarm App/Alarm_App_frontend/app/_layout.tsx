import React from 'react';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { initializeStorage } from '@/utils/storage';
import { configureNotifications } from '@/utils/notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent auto-hide for all platforms to ensure consistent behavior
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Ignore errors */
});

export default function RootLayout() {
  useFrameworkReady();
  const [appIsReady, setAppIsReady] = useState(false);

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium, 
    'Inter-Bold': Inter_700Bold,
  });

  // Initialize app when loading completes
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize app
        await initializeStorage();
        await configureNotifications();
      } catch (e) {
        console.warn('Error during app initialization:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Hide splash screen once fonts are loaded and app is initialized
  useEffect(() => {
    if ((fontsLoaded || fontError) && appIsReady) {
      SplashScreen.hideAsync().catch(() => {
        /* Ignore errors */
      });
    }
  }, [fontsLoaded, fontError, appIsReady]);

  // Show nothing while loading
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#121212' },
        animation: 'slide_from_right',
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}