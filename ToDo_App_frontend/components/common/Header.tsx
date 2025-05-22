import React from 'react';
import { View, Text, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import BackButton from './BackButton';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title: string;
  scrollY: Animated.Value;
  showBack?: boolean;
}

export default function Header({ title, scrollY, showBack = false }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Header animation based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  return (
    <Animated.View 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        opacity: headerOpacity,
        paddingTop: insets.top,
      }}
    >
      <BlurView 
        intensity={30} 
        tint="dark" 
        className="w-full h-full absolute"
      />
      <View className="h-14 px-4 flex-row items-center justify-center">
        {showBack && (
          <View className="absolute left-2">
            <BackButton onPress={() => router.back()} />
          </View>
        )}
        <Text className="text-foreground font-['Inter-Medium']">{title}</Text>
      </View>
      <View className="h-px bg-background-tertiary" />
    </Animated.View>
  );
}