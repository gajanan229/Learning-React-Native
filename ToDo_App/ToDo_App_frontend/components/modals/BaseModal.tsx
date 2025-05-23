import React, { ReactNode } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const { height } = Dimensions.get('window');

export default function BaseModal({ visible, onClose, children }: BaseModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Animated.View 
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0"
        >
          <BlurView 
            tint="dark" 
            intensity={30} 
            className="flex-1"
          />
          <TouchableOpacity
            className="absolute inset-0 bg-black/50"
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>
        
        {/* Content */}
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          className="bg-background-secondary rounded-t-3xl overflow-hidden"
          style={styles.content}
        >
          {/* Handle */}
          <View className="items-center pt-2 pb-4">
            <View className="w-10 h-1 rounded-full bg-foreground-tertiary" />
          </View>
          
          {/* Close button */}
          <TouchableOpacity
            className="absolute right-4 top-4 p-2 rounded-full"
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X color="#787878" size={20} />
          </TouchableOpacity>
          
          {/* Modal content */}
          <View className="px-4 pb-6">
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    maxHeight: height * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
});