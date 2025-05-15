import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, shadows, animations } from '../../constants/theme';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg'; // Optional size prop
}

const TRACK_HEIGHT_MD = 28;
const TRACK_WIDTH_MD = 50;
const THUMB_SIZE_MD = 24;
const PADDING = 2; // Padding inside the track for the thumb

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  style,
  size = 'md',
}) => {
  const progress = useSharedValue(value ? 1 : 0);

  // Define dimensions based on size prop
  const trackHeight = size === 'sm' ? TRACK_HEIGHT_MD * 0.8 : size === 'lg' ? TRACK_HEIGHT_MD * 1.2 : TRACK_HEIGHT_MD;
  const trackWidth = size === 'sm' ? TRACK_WIDTH_MD * 0.8 : size === 'lg' ? TRACK_WIDTH_MD * 1.2 : TRACK_WIDTH_MD;
  const thumbSize = size === 'sm' ? THUMB_SIZE_MD * 0.8 : size === 'lg' ? THUMB_SIZE_MD * 1.2 : THUMB_SIZE_MD;
  const thumbTranslateX = trackWidth - thumbSize - PADDING * 2;

  React.useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, {
      duration: animations.durations.fast, // Use theme animation duration
    });
  }, [value, progress]);

  const toggleSwitch = () => {
    if (!disabled) {
      onValueChange(!value);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Haptic feedback
    }
  };

  const animatedThumbStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [PADDING, PADDING + thumbTranslateX],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateX }],
    };
  });

  const animatedTrackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [colors.interactive.secondary, colors.accent.primary] // Dark gray for OFF, accent for ON
    );
    return {
      backgroundColor,
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleSwitch}
      disabled={disabled}
      style={[
        styles.container,
        style,
        disabled && styles.disabled,
        { width: trackWidth, height: trackHeight, borderRadius: trackHeight / 2 }, // Dynamic container size
      ]}
    >
      <Reanimated.View
        style={[
          styles.track,
          animatedTrackStyle,
          { borderRadius: trackHeight / 2, width: trackWidth, height: trackHeight }, // Dynamic track size
        ]}
      >
        <Reanimated.View
          style={[
            styles.thumb,
            animatedThumbStyle,
            { width: thumbSize, height: thumbSize, borderRadius: thumbSize / 2 }, // Dynamic thumb size
            shadows.sm, // Applying subtle shadow to thumb
          ]}
        />
      </Reanimated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    // Width, height, and borderRadius are now set dynamically
  },
  track: {
    justifyContent: 'center',
    // Width, height, and borderRadius are now set dynamically
  },
  thumb: {
    position: 'absolute',
    backgroundColor: colors.text.primary, // Light thumb color
    // width, height, borderRadius are set dynamically
    // Using shadows.sm from theme for elevation
  },
  disabled: {
    opacity: 0.6, // Slightly more opaque for better visibility of disabled state
  },
});

export default ToggleSwitch;