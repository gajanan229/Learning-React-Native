import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string; 
  textClassName?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  className = '', 
  textClassName = '',
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

  const buttonBaseClasses = 'flex-row items-center justify-center rounded-md py-2 px-4 shadow-sm';
  const buttonPrimaryColorClasses = 'bg-[#007AFF]';

  let combinedButtonClasses = `${buttonBaseClasses} ${buttonPrimaryColorClasses}`;
  if (isLoading || disabled) {
    combinedButtonClasses += ' opacity-50';
  }
  if (className) {
    combinedButtonClasses += ` ${className}`;
  }
  combinedButtonClasses = combinedButtonClasses.trim().replace(/\s+/g, ' ');


  const textBaseClasses = 'font-medium text-center text-base mx-1';
  const textPrimaryColorClasses = 'text-white';

  let combinedTextClasses = `${textBaseClasses} ${textPrimaryColorClasses}`;
  if (textClassName) {
    combinedTextClasses += ` ${textClassName}`;
  }
  combinedTextClasses = combinedTextClasses.trim().replace(/\s+/g, ' ');
  
  const activityIndicatorColor = "#FFFFFF";

  return (
    <AnimatedTouchable
      className={combinedButtonClasses}
      style={[animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLoading || disabled}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={activityIndicatorColor}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            className={combinedTextClasses}
            style={textStyle}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </AnimatedTouchable>
  );
};

export default Button;