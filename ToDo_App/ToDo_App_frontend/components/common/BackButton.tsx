import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

interface BackButtonProps {
  onPress: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
  return (
    <TouchableOpacity
      className="h-10 w-10 rounded-full items-center justify-center"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ChevronLeft color="#EEEEEE" size={24} />
    </TouchableOpacity>
  );
}