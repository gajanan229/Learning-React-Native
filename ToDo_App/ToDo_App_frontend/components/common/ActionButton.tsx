import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Plus, SquareCheck as CheckSquare, FolderPlus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  FadeInUp, 
  FadeInDown
} from 'react-native-reanimated';

interface ActionButtonProps {
  mode?: 'task' | 'folder';
  folderId?: string;
}

export default function ActionButton({ mode = 'task', folderId }: ActionButtonProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
    };
  });
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    rotation.value = withSpring(isExpanded ? 0 : 45);
    scale.value = withSpring(1, { damping: 15 });
  };
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  const handleAddTask = () => {
    setIsExpanded(false);
    rotation.value = withSpring(0);
    router.push('/Create/new-task');
  };
  
  const handleAddFolder = () => {
    setIsExpanded(false);
    rotation.value = withSpring(0);
    router.push('/Create/new-folder');
  };
  
  return (
    <>
      {/* Background overlay when expanded */}
      {isExpanded && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleExpanded}
          className="absolute inset-0 bg-black/30"
          style={{ zIndex: 100 }}
        />
      )}
      
      {/* Action buttons when expanded */}
      {isExpanded && (
        <View 
          className="absolute right-8 items-end"
          style={{ bottom: insets.bottom + 150, zIndex: 101 }}
        >
          <Animated.View 
            entering={FadeInDown.duration(200).delay(50)} 
            className="flex-row items-center mb-4"
          >
            <View className="bg-background-secondary rounded-xl px-3 py-2 mr-3">
              <Text className="text-foreground">Add Task</Text>
            </View>
            <TouchableOpacity
              onPress={handleAddTask}
              className="w-12 h-12 rounded-full bg-success items-center justify-center"
              style={styles.actionButton}
            >
              <CheckSquare color="white" size={20} />
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View 
            entering={FadeInDown.duration(200)} 
            className="flex-row items-center"
          >
            <View className="bg-background-secondary rounded-xl px-3 py-2 mr-3">
              <Text className="text-foreground">Add Folder</Text>
            </View>
            <TouchableOpacity
              onPress={handleAddFolder}
              className="w-12 h-12 rounded-full bg-accent items-center justify-center"
              style={styles.actionButton}
            >
              <FolderPlus color="white" size={20} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
      
      {/* Main action button */}
      <Animated.View 
        style={[
          { position: 'absolute', right: 24, bottom: insets.bottom + 16 + 60, zIndex: 102 },
          animatedStyles
        ]}
      >
        <TouchableOpacity
          onPress={toggleExpanded}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="w-16 h-16 rounded-full bg-accent items-center justify-center"
          style={styles.mainButton}
          activeOpacity={0.9}
        >
          <Plus color="white" size={28} />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  mainButton: {
    shadowColor: '#2D88FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  }
});