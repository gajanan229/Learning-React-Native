import React from 'react';
import { View, StyleSheet } from 'react-native';

interface EventIndicatorProps {
  color: string;
}

export function EventIndicator({ color }: EventIndicatorProps) {
  return (
    <View style={[styles.indicator, { backgroundColor: color }]} />
  );
}

const styles = StyleSheet.create({
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
});