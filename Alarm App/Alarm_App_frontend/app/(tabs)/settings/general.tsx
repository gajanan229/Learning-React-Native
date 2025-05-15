import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, typography, spacing } from '../../../constants/theme';
import ToggleSwitch from '../../../components/ui/ToggleSwitch';
import useSettingsStore from '../../../store/useSettingsStore';
import useSoundStore from '../../../store/useSoundStore';
import SoundPicker from '../../../components/alarm/SoundPicker';

export default function GeneralSettings() {
  const { settings, updateSettings, fetchSettings } = useSettingsStore();
  const { getSoundById } = useSoundStore();
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSoundPickerVisible, setIsSoundPickerVisible] = useState(false);
  
  // Load settings
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  // Update local state when settings change
  useEffect(() => {
    setTheme(settings.theme);
  }, [settings]);
  
  // Handle theme change
  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    updateSettings({ theme: newTheme });
  };
  
  // Handle snooze duration change
  const handleSnoozeDurationChange = (duration: number) => {
    updateSettings({ defaultSnoozeDuration: duration });
  };
  
  // Handle sound selection
  const handleSoundSelect = (sound: any) => {
    updateSettings({ defaultSoundId: sound.id });
  };
  
  // Handle DND integration toggle
  const handleDndToggle = () => {
    updateSettings({ dndIntegration: !settings.dndIntegration });
  };
  
  // Get selected sound name
  const selectedSound = getSoundById(settings.defaultSoundId);
  
  return (
    <ScrollView style={styles.container}>
      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Theme</Text>
        
        <View style={styles.themeSelector}>
          <TouchableOpacity
            style={[
              styles.themeButton,
              theme === 'dark' && styles.themeButtonActive,
            ]}
            onPress={() => handleThemeChange('dark')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.themeButtonText,
                theme === 'dark' && styles.themeButtonTextActive,
              ]}
            >
              Dark
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.themeButton,
              theme === 'light' && styles.themeButtonActive,
            ]}
            onPress={() => handleThemeChange('light')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.themeButtonText,
                theme === 'light' && styles.themeButtonTextActive,
              ]}
            >
              Light
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Defaults Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Defaults</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Default Snooze Duration</Text>
          <View style={styles.durationSelector}>
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => handleSnoozeDurationChange(Math.max(1, settings.defaultSnoozeDuration - 1))}
              disabled={settings.defaultSnoozeDuration <= 1}
            >
              <Text style={styles.durationButtonText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.durationText}>{settings.defaultSnoozeDuration} minutes</Text>
            
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => handleSnoozeDurationChange(Math.min(30, settings.defaultSnoozeDuration + 1))}
              disabled={settings.defaultSnoozeDuration >= 30}
            >
              <Text style={styles.durationButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setIsSoundPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.settingLabel}>Default Alarm Sound</Text>
          <View style={styles.settingValueContainer}>
            <Text style={styles.settingValue}>{selectedSound?.name || 'Default'}</Text>
            <ChevronRight size={20} color={colors.text.secondary} />
          </View>
        </TouchableOpacity>
      </View>
      
      {/* System Integration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Integration</Text>
        
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Do Not Disturb Integration</Text>
            <Text style={styles.settingDescription}>
              Attempt to override system DND for alarms (behavior varies by OS).
            </Text>
          </View>
          <ToggleSwitch
            value={settings.dndIntegration}
            onValueChange={handleDndToggle}
          />
        </View>
      </View>
      
      {/* Permissions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Required Permissions</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <TouchableOpacity style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Sound Picker Modal */}
      <SoundPicker
        visible={isSoundPickerVisible}
        onClose={() => setIsSoundPickerVisible(false)}
        selectedSoundId={settings.defaultSoundId}
        onSelect={handleSoundSelect}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  section: {
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  themeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.interactive.primary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  themeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  themeButtonActive: {
    backgroundColor: colors.accent.primary,
  },
  themeButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  themeButtonTextActive: {
    color: colors.text.primary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.interactive.secondary,
  },
  settingLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  settingDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    maxWidth: '80%',
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  durationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
  },
  durationText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginHorizontal: spacing.md,
  },
  permissionButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
  },
  permissionButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
});