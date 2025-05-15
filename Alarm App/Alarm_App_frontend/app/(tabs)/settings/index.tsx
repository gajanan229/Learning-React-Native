import React, { useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, typography, spacing } from '../../../constants/theme';
import GeneralSettings from './general';
import FoldersSettings from './folders';

const Tab = createMaterialTopTabNavigator();

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.headerRight} />
      </View>
      
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.accent.primary,
          tabBarInactiveTintColor: colors.text.secondary,
          tabBarIndicatorStyle: styles.tabIndicator,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen name="General" component={GeneralSettings} />
        <Tab.Screen name="Folders" component={FoldersSettings} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + spacing.lg, // Account for status bar
    paddingBottom: spacing.md,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40, // For balanced layout
  },
  tabBar: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.interactive.secondary,
  },
  tabIndicator: {
    backgroundColor: colors.accent.primary,
    height: 3,
  },
  tabLabel: {
    fontFamily: typography.fontFamily.medium,
    textTransform: 'none',
    fontSize: typography.fontSize.md,
  },
});