import { Stack } from 'expo-router';
import React from 'react';

export default function ModalLayout() {
    return (
        <Stack screenOptions={{ 
            presentation: 'modal', 
            headerShown: false 
        }}>
            <Stack.Screen name="rateMovie" />
            {/* Add other modal screens here if you create more */}
        </Stack>
    );
} 