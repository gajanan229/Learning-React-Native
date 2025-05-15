import { useEffect } from 'react';
import { Redirect } from 'expo-router';

// Redirect to home screen
export default function Index() {
  return <Redirect href="/(tabs)" />;
}