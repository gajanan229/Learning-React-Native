import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { NeumorphicView } from './NeumorphicView';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}: ButtonProps) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  
  const getBackgroundColor = () => {
    if (disabled) return '#4a4a52';
    
    switch (variant) {
      case 'primary':
        return colors.accent;
      case 'secondary':
        return 'transparent';
      case 'danger':
        return '#e53e3e';
      default:
        return colors.accent;
    }
  };
  
  const getTextColor = () => {
    if (disabled) return '#9CA3AF';
    
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return colors.text;
      case 'danger':
        return '#FFFFFF';
      default:
        return '#FFFFFF';
    }
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, style]}
      activeOpacity={0.7}
    >
      <NeumorphicView
        style={[
          styles.buttonInner,
          {
            backgroundColor: getBackgroundColor(),
          }
        ]}
        isPressed={variant === 'secondary'}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            {leftIcon && <Text style={styles.iconLeft}>{leftIcon}</Text>}
            <Text style={[
              styles.text,
              { color: getTextColor() },
              textStyle
            ]}>
              {title}
            </Text>
            {rightIcon && <Text style={styles.iconRight}>{rightIcon}</Text>}
          </>
        )}
      </NeumorphicView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 100,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});