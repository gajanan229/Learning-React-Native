import { Stack } from 'expo-router';

export default function CreateLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="new-task" options={{ headerShown: false }} />
      <Stack.Screen name="new-folder" options={{ headerShown: false }} />
    </Stack>
  );
} 