import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';

interface NeumorphicViewProps {
  style?: ViewStyle;
  children?: React.ReactNode;
  lightShadowColor?: string;
  darkShadowColor?: string;
  isPressed?: boolean;
}

export function NeumorphicView({
  style,
  children,
  lightShadowColor,
  darkShadowColor,
  isPressed = false
}: NeumorphicViewProps) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  
  const lightShadow = lightShadowColor || '#242428';
  const darkShadow = darkShadowColor || '#0a0a0c';
  
  return (
    <View style={[
      styles.container,
      style,
      {
        backgroundColor: colors.secondaryBackground || '#1E1E24',
        shadowColor: isPressed ? darkShadow : lightShadow,
        shadowOffset: isPressed 
          ? { width: -2, height: -2 } 
          : { width: 5, height: 5 },
      }
    ]}>
      <LinearGradient
        colors={isPressed 
          ? ['#1a1a1e', '#1E1E24'] 
          : ['#242428', '#1a1a1e']}
        style={[
          StyleSheet.absoluteFill,
          styles.gradient,
          style ? { borderRadius: (style.borderRadius as number) || 8 } : null
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 8,
  },
  content: {
    borderRadius: 8,
    overflow: 'hidden',
  }
});