import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { NeumorphicView } from '@/components/ui/NeumorphicView';
import { Calendar, Bell, Clock, Globe, Info, Moon, Sun, LogOut } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';

export default function SettingsScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  const auth = useAuthStore();
  
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<'Sunday' | 'Monday'>('Sunday');
  const [defaultView, setDefaultView] = useState<'Month' | 'Week' | 'Day' | 'Agenda'>('Month');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultReminderTime, setDefaultReminderTime] = useState('15 minutes before');
  
  const handleFirstDayToggle = () => {
    setFirstDayOfWeek(prevState => prevState === 'Sunday' ? 'Monday' : 'Sunday');
  };
  
  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    action: React.ReactNode,
    onPress?: () => void
  ) => {
    const itemContent = (
      <>
        <View style={styles.settingIconContainer}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.settingSubtitle, { color: colors.subtleText }]}>{subtitle}</Text>
        </View>
        <View style={styles.settingAction}>
          {action}
        </View>
      </>
    );

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <NeumorphicView style={styles.settingItem}>
            {itemContent}
          </NeumorphicView>
        </TouchableOpacity>
      );
    }

    return (
      <NeumorphicView style={styles.settingItem}>
        {itemContent}
      </NeumorphicView>
    );
  };
  
  const handleDefaultViewChange = (view: 'Month' | 'Week' | 'Day' | 'Agenda') => {
    setDefaultView(view);
  };

  const handleLogout = async () => {
    await auth.logout();
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtleText }]}>APPEARANCE</Text>
          
          {renderSettingItem(
            colorScheme === 'dark' ? <Moon size={24} color={colors.accent} /> : <Sun size={24} color={colors.accent} />,
            'Theme',
            colorScheme === 'dark' ? 'Dark mode is on' : 'Light mode is on',
            <Switch
              value={colorScheme === 'dark'}
              onValueChange={toggleColorScheme}
              trackColor={{ false: '#3e3e3e', true: '#81b0ff' }}
              thumbColor={colorScheme === 'dark' ? colors.accent : '#f4f3f4'}
            />
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtleText }]}>CALENDAR</Text>
          
          {renderSettingItem(
            <Calendar size={24} color={colors.accent} />,
            'Default View',
            `Open calendar in ${defaultView} view`,
            <View style={styles.optionsContainer}>
              {(['Month', 'Week', 'Day', 'Agenda'] as const).map((view) => (
                <TouchableOpacity
                  key={view}
                  style={[
                    styles.optionButton,
                    defaultView === view && { 
                      backgroundColor: colors.accentTransparent 
                    }
                  ]}
                  onPress={() => handleDefaultViewChange(view)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: defaultView === view ? colors.accent : colors.text }
                    ]}
                  >
                    {view}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {renderSettingItem(
            <Calendar size={24} color={colors.accent} />,
            'First Day of Week',
            firstDayOfWeek,
            <Switch
              value={firstDayOfWeek === 'Monday'}
              onValueChange={handleFirstDayToggle}
              trackColor={{ false: '#3e3e3e', true: '#81b0ff' }}
              thumbColor={firstDayOfWeek === 'Monday' ? colors.accent : '#f4f3f4'}
            />
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtleText }]}>NOTIFICATIONS</Text>
          
          {renderSettingItem(
            <Bell size={24} color={colors.accent} />,
            'Notifications',
            notificationsEnabled ? 'Enabled' : 'Disabled',
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#3e3e3e', true: '#81b0ff' }}
              thumbColor={notificationsEnabled ? colors.accent : '#f4f3f4'}
            />
          )}
          
          {renderSettingItem(
            <Clock size={24} color={colors.accent} />,
            'Default Reminder',
            defaultReminderTime,
            <Text style={[styles.actionText, { color: colors.accent }]}>Change</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtleText }]}>ABOUT</Text>
          
          {renderSettingItem(
            <Info size={24} color={colors.accent} />,
            'About ChronoShade',
            'Version 1.0.0',
            <Text style={[styles.actionText, { color: colors.accent }]}>More</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtleText }]}>ACCOUNT</Text>
          {renderSettingItem(
            <LogOut size={24} color={colors.destructive} />,
            'Logout',
            'Sign out of your account',
            <View />,
            handleLogout
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  settingAction: {
    marginLeft: 8,
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  optionsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  optionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});