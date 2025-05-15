import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 200,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
  };

  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    disabled && styles.button_disabled,
    Platform.OS === 'ios' && shadows.sm,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.text_disabled,
    textStyle,
  ];

  return (
    <AnimatedTouchable
      style={[buttonStyles, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLoading || disabled}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.text.primary : colors.accent.primary}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={textStyles}>{title}</Text>
          {rightIcon}
        </>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  
  // Variant styles
  button_primary: {
    backgroundColor: colors.accent.primary,
  },
  button_secondary: {
    backgroundColor: colors.interactive.primary,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  button_destructive: {
    backgroundColor: colors.accent.destructive,
  },
  button_text: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  
  // Size styles
  button_sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  button_md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  button_lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  
  // Disabled state
  button_disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
    marginHorizontal: spacing.xs,
  },
  
  // Text variant styles
  text_primary: {
    color: colors.text.primary,
  },
  text_secondary: {
    color: colors.text.primary,
  },
  text_outline: {
    color: colors.accent.primary,
  },
  text_destructive: {
    color: colors.text.primary,
  },
  text_text: {
    color: colors.accent.primary,
  },
  
  // Text size styles
  text_sm: {
    fontSize: typography.fontSize.sm,
  },
  text_md: {
    fontSize: typography.fontSize.md,
  },
  text_lg: {
    fontSize: typography.fontSize.lg,
  },
  
  // Text disabled state
  text_disabled: {
    opacity: 0.7,
  },
});

export default Button;