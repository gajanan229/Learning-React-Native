import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DayShort } from '../../types';
import { colors, typography, borderRadius, spacing } from '../../constants/theme';

interface DayBadgeProps {
  day: DayShort;
  isActive: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const DayBadge: React.FC<DayBadgeProps> = ({
  day,
  isActive,
  onPress,
  size = 'md',
}) => {
  const ContainerComponent = onPress ? TouchableOpacity : View;

  return (
    <ContainerComponent
      style={[
        styles.container,
        styles[`container_${size}`],
        isActive && styles.container_active,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          styles[`text_${size}`],
          isActive && styles.text_active,
        ]}
      >
        {day}
      </Text>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.interactive.primary,
    marginHorizontal: 2,
  },
  container_active: {
    backgroundColor: colors.accent.primary,
  },
  container_sm: {
    width: 20,
    height: 20,
  },
  container_md: {
    width: 28,
    height: 28,
  },
  container_lg: {
    width: 36,
    height: 36,
  },
  text: {
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  text_active: {
    color: colors.text.primary,
  },
  text_sm: {
    fontSize: typography.fontSize.xs,
  },
  text_md: {
    fontSize: typography.fontSize.sm,
  },
  text_lg: {
    fontSize: typography.fontSize.md,
  },
});

export default DayBadge;