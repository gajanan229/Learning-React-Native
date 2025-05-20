import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, Href } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import TextField from '@/components/ui/TextField';
import {Button} from '@/components/ui/Button';
import colors from '@/constants/Colors';
import { spacing, typography, borderRadius, shadows } from '@/constants/Theme';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const {
    register,
    isLoading,
    error: authError,
  } = useAuthStore(state => ({
    register: state.register,
    isLoading: state.isLoading,
    error: state.error,
  }));

  const [localError, setLocalError] = useState('');

  // Basic email validation regex
  const isValidEmail = (emailToTest: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToTest);
  };

  const handleRegister = async () => {
    setLocalError('');
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setLocalError('All fields are required.');
      return;
    }
    if (!isValidEmail(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (password.length < 1) { // Example: Basic password length validation
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      await register(email, password, username);
      // Navigation will be handled by RootLayout on isAuthenticated state change
    } catch (apiError: any) {
      console.error('Registration API failed (caught in component):', apiError.message);
      // Error is already set in authStore, UI should use authError
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Your Calendar App</Text>

          <View style={styles.inputWrapper}>
            <TextField
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={styles.inputField}
              error={authError && authError.toLowerCase().includes('username') ? authError : undefined}
            />
          </View>

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
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.inputField}
              error={authError && authError.toLowerCase().includes('password') && !authError.toLowerCase().includes('match') ? authError : undefined}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextField
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.inputField}
              error={authError && authError.toLowerCase().includes('match') ? authError : undefined}
            />
          </View>

          {authError && 
            !authError.toLowerCase().includes('username') && 
            !authError.toLowerCase().includes('email') && 
            !authError.toLowerCase().includes('password') && 
            !authError.toLowerCase().includes('match') && (
            <Text style={styles.globalErrorText}>{authError}</Text>
          )}
          {localError && <Text style={styles.globalErrorText}>{localError}</Text>}

          <Button
            title={isLoading ? 'Creating Account...' : 'Sign Up'}
            onPress={handleRegister}
            disabled={isLoading}
            variant="primary"
            style={styles.registerButton}
            leftIcon={isLoading ? <ActivityIndicator size="small" color={colors.dark.text} /> : undefined}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            {/* Ensure app/(auth)/login.tsx route exists */}
            <Link href={'/(auth)/login' as any} style={styles.signInLink}>
              <Text style={styles.signInLinkText}>Sign In</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles are similar to LoginScreen, with minor adjustments if needed
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
    fontSize: typography.fontSize['2xl'],
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
    // Direct styling for TextField if needed
  },
  registerButton: {
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
  signInLink: {
    // Add appropriate styles for the Link component
  },
  signInLinkText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.dark.accent,
  },
}); 