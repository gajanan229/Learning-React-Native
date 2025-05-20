import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, Href } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore'; // Adjust path as per your project structure
import TextField from '@/components/ui/TextField'; // Assuming this path
import {Button} from '@/components/ui/Button';    // Assuming this path
import colors from '@/constants/Colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/Theme'; // Adjust path and added shadows

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const {
    login,
    isLoading,
    error: authError, // Renamed to avoid conflict with potential local error state
  } = useAuthStore(state => ({
    login: state.login,
    isLoading: state.isLoading,
    error: state.error,
  }));

  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    setLocalError(''); // Clear previous local errors
    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required.');
      return;
    }

    try {
      await login(email, password);
      // Navigation will be handled by the RootLayout based on isAuthenticated state change
    } catch (apiError: any) {
      // The error is already set in the authStore, 
      // but if re-thrown, we catch it here. UI should primarily use authStore.error.
      console.error('Login API failed (caught in component):', apiError.message);
      // setLocalError(apiError.message || 'An unexpected error occurred.'); // Optionally set local error too
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>ChronoFold</Text>
          <Text style={styles.subtitle}>Welcome Back</Text>

          <View style={styles.inputWrapper}>
            <TextField
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.inputField}
              error={authError && authError.toLowerCase().includes('email') ? authError : undefined}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.inputField}
              error={authError && authError.toLowerCase().includes('password') ? authError : undefined}
            />
          </View>

          {authError && !authError.toLowerCase().includes('email') && !authError.toLowerCase().includes('password') && (
            <Text style={styles.globalErrorText}>{authError}</Text>
          )}
          {localError && <Text style={styles.globalErrorText}>{localError}</Text>}

          <Button
            title={isLoading ? 'Logging In...' : 'Login'}
            onPress={handleLogin}
            disabled={isLoading}
            variant="primary"
            style={styles.loginButton}
            leftIcon={isLoading ? <ActivityIndicator size="small" color={colors.dark.text} /> : undefined}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don\'t have an account? </Text>
            <Link href={'/(auth)/register' as any} style={styles.signUpLink}>
              <Text style={styles.signUpLinkText}>Sign Up</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.dark.secondaryBackground,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['3xl'],
    color: colors.dark.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.dark.subtleText,
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    marginBottom: spacing.md,
    width: '100%',
  },
  inputField: {
    // Add any direct styling needed for TextField here, e.g., height, padding if not handled internally
  },
  loginButton: {
    marginTop: spacing.md,
    width: '100%',
  },
  globalErrorText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.dark.destructive,
    textAlign: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.dark.subtleText,
  },
  signUpLink: {},
  signUpLinkText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.dark.accent,
  },
}); 