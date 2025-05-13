import { Stack } from 'expo-router';
import React from 'react';

export default function ModalLayout() {
    return (
        <Stack screenOptions={{ 
            presentation: 'modal', 
            headerShown: false 
        }}>
            <Stack.Screen name="rateMovie" />
            <Stack.Screen name="createListModal" />
            <Stack.Screen name="addToListModal" options={{ title: "Add to List" }} />
            {/* Add other modal screens here if you create more */}
        </Stack>
    );
} 