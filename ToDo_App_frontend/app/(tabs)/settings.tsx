import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LogOut, User, Mail } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';
import Button from '@/components/ui/Button';

export default function SettingsScreen() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Use individual store subscriptions
  const currentUser = useAuthStore(state => state.currentUser);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      {/* Header */}
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 32 }}>
        <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>Settings</Text>
      </View>

      {/* User Info Section */}
      <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
        <View style={{ backgroundColor: '#1A1A1A', borderRadius: 12, padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Account</Text>
          
          {/* Username */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ backgroundColor: '#2A2A2A', borderRadius: 8, padding: 8, marginRight: 12 }}>
              <User size={20} color="#007AFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#A0A0A0', fontSize: 12, marginBottom: 2 }}>Username</Text>
              <Text style={{ color: 'white', fontSize: 16 }}>{currentUser?.username || 'N/A'}</Text>
            </View>
          </View>

          {/* Email */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#2A2A2A', borderRadius: 8, padding: 8, marginRight: 12 }}>
              <Mail size={20} color="#007AFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#A0A0A0', fontSize: 12, marginBottom: 2 }}>Email</Text>
              <Text style={{ color: 'white', fontSize: 16 }}>{currentUser?.email || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions Section */}
      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ backgroundColor: '#1A1A1A', borderRadius: 12, padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Actions</Text>
          
          {/* Logout Button */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#2A2A2A',
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <View style={{ backgroundColor: '#FF3B30', borderRadius: 6, padding: 6, marginRight: 12 }}>
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <LogOut size={18} color="white" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Text>
              <Text style={{ color: '#A0A0A0', fontSize: 12, marginTop: 2 }}>
                Sign out of your account
              </Text>
            </View>
          </TouchableOpacity>

          {/* Alternative Logout Button using our Button component */}
          <Button
            title={isLoggingOut ? 'Logging Out...' : 'Logout'}
            onPress={handleLogout}
            disabled={isLoggingOut}
            className="w-full"
            leftIcon={isLoggingOut ? <ActivityIndicator size="small" color="#FFFFFF" /> : <LogOut size={18} color="white" />}
            style={{ backgroundColor: '#FF3B30' }}
          />
        </View>
      </View>

      {/* App Info Section */}
      <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
        <View style={{ backgroundColor: '#1A1A1A', borderRadius: 12, padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 16 }}>App Info</Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#A0A0A0', fontSize: 12, marginBottom: 2 }}>Version</Text>
            <Text style={{ color: 'white', fontSize: 16 }}>1.0.0</Text>
          </View>

          <View>
            <Text style={{ color: '#A0A0A0', fontSize: 12, marginBottom: 2 }}>App Name</Text>
            <Text style={{ color: 'white', fontSize: 16 }}>ChronoFold</Text>
          </View>
        </View>
      </View>
    </View>
  );
} 