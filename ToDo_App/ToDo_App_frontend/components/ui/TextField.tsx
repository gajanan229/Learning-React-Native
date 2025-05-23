import React from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';

interface TextFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  className?: string;
  inputClassName?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  className = '',
  inputClassName = '',
}) => {
  const containerClasses = `mb-4 ${className}`.trim();
  const labelClasses = 'font-medium text-sm text-white mb-1'.trim();
  const inputContainerClasses = 'flex-row items-center border border-[#333333] rounded-md bg-[#2A2A2A]'.trim();
  
  let currentInputClasses = `flex-1 font-normal text-base text-white py-2 px-4 ${inputClassName}`.trim();

  const rightIconContainerClasses = 'px-2'.trim();
  const errorClasses = 'font-normal text-xs text-[#FF3B30] mt-1'.trim();

  return (
    <View style={style} className={containerClasses}>
      {label && <Text className={labelClasses}>{label}</Text>}
      
      <View className={inputContainerClasses}>
        <TextInput
          style={[
            multiline && { height: numberOfLines * 24, paddingTop: 8, paddingBottom: 8 },
            inputStyle,
          ]}
          className={currentInputClasses}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          selectionColor="#007AFF"
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            className={rightIconContainerClasses}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text className={errorClasses}>{error}</Text>}
    </View>
  );
};

export default TextField;