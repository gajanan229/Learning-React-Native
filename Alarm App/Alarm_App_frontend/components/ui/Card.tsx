import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue
} from 'react-native-reanimated';
import { colors, borderRadius, shadows, spacing } from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  onPress,
  elevation = 'md'
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
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

  const Container = onPress ? AnimatedPressable : View;
  const containerProps = onPress ? {
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    onPress,
    style: [styles.card, styles[`elevation_${elevation}`], style, animatedStyle],
  } : {
    style: [styles.card, styles[`elevation_${elevation}`], style],
  };

  return (
    <Container {...containerProps}>
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.interactive.primary,
  },
  elevation_none: {},
  elevation_sm: {
    ...shadows.sm,
  },
  elevation_md: {
    ...shadows.md,
  },
  elevation_lg: {
    ...shadows.lg,
  },
});

export default Card;