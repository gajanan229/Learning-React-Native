import { AuthProvider, useAuth } from '../context/AuthContext';
import { SplashScreen, Stack, Redirect, Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native'; // For a simple loading indicator
import './global.css';
import {StatusBar} from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar hidden={true} />
            <RootNavigation />
        </AuthProvider>
    );
}

function RootNavigation() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) {
            return; // Don't do anything if auth state is still loading
        }

        SplashScreen.hideAsync(); // Hide splash screen once loading is finished

        if (isAuthenticated) {
            // If authenticated, replace the current route with the main app tabs
            router.replace('/(tabs)'); // Or your primary authenticated route
        } else {
            // If not authenticated, replace with the login screen
            router.replace('/(auth)/login');
        }
    }, [isLoading, isAuthenticated, router]); // Depend on these states

    if (isLoading) {
        // Show a loading indicator while AuthContext is checking auth state
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0D23' /* Or your primary bg */ }}>
                <Text style={{ color: 'white' }}>Loading...</Text>
                {/* You can add an ActivityIndicator here too */}
            </View>
        );
    }

    // Once loading is complete, Slot will render the appropriate child route
    // based on the navigation performed in useEffect.
    // This ensures a navigator component is always rendered by RootNavigation
    // after the initial loading phase.
    return <Slot />;
}
