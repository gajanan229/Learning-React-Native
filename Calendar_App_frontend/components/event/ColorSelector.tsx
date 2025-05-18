import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { Check } from 'lucide-react-native';

interface ColorSelectorProps {
  colors: string[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export function ColorSelector({ 
  colors, 
  selectedColor, 
  onSelectColor 
}: ColorSelectorProps) {
  const { colorScheme } = useColorScheme();
  const themeColors = Colors[colorScheme];
  
  return (
    <View style={styles.container}>
      {colors.map((color, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.colorButton,
            { backgroundColor: color },
            selectedColor === color && styles.selectedColor,
          ]}
          onPress={() => onSelectColor(color)}
          activeOpacity={0.7}
        >
          {selectedColor === color && (
            <Check size={16} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});