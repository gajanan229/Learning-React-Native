import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Play, Check } from 'lucide-react-native';
import { SoundOption } from '../../types';
import { colors, typography, spacing } from '../../constants/theme';
import Modal from '../ui/Modal';
import useSoundStore from '../../store/useSoundStore';

interface SoundPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedSoundId: string;
  onSelect: (sound: SoundOption) => void;
}

const SoundPicker: React.FC<SoundPickerProps> = ({
  visible,
  onClose,
  selectedSoundId,
  onSelect,
}) => {
  const { getSounds, getSoundById, playSound, stopSound, isPlaying, currentSoundId } = useSoundStore();
  
  const sounds = getSounds();
  
  // Handle sound selection
  const handleSelect = (sound: SoundOption) => {
    onSelect(sound);
    stopSound();
    onClose();
  };
  
  // Handle play sound preview
  const handlePlaySound = (soundId: string) => {
    if (isPlaying && currentSoundId === soundId) {
      stopSound();
    } else {
      playSound(soundId);
    }
  };
  
  // Render a sound item
  const renderSoundItem = ({ item }: { item: SoundOption }) => {
    const isSelected = item.id === selectedSoundId;
    const isCurrentlyPlaying = isPlaying && currentSoundId === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.soundItem,
          isSelected && styles.selectedSoundItem,
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.soundInfo}>
          {isSelected && (
            <Check size={18} color={colors.accent.primary} style={styles.checkIcon} />
          )}
          <Text
            style={[
              styles.soundName,
              isSelected && styles.selectedSoundName,
            ]}
          >
            {item.name}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.playButton,
            isCurrentlyPlaying && styles.playingButton,
          ]}
          onPress={() => handlePlaySound(item.id)}
        >
          <Play size={20} color={isCurrentlyPlaying ? colors.text.primary : colors.accent.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  
  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Select Sound</Text>
        
        <FlatList
          data={sounds}
          renderItem={renderSoundItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          style={styles.list}
        />
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  list: {
    maxHeight: 300,
  },
  listContainer: {
    paddingBottom: spacing.md,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.interactive.secondary,
  },
  selectedSoundItem: {
    backgroundColor: colors.interactive.primary,
  },
  soundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkIcon: {
    marginRight: spacing.sm,
  },
  soundName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  selectedSoundName: {
    color: colors.accent.primary,
  },
  playButton: {
    backgroundColor: colors.interactive.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingButton: {
    backgroundColor: colors.accent.primary,
  },
  cancelButton: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.accent.primary,
  },
});

export default SoundPicker;