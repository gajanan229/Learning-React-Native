import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { Folder, Day, RecurrencePreset, presetDays } from '../../types';
import Modal from '../ui/Modal';
import TextField from '../ui/TextField';
import Button from '../ui/Button';
import DaySelector from '../ui/DaySelector';

interface FolderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  folder?: Folder;
}

const FolderModal: React.FC<FolderModalProps> = ({
  visible,
  onClose,
  onSave,
  folder,
}) => {
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [preset, setPreset] = useState<RecurrencePreset>('weekdays');
  const [nameError, setNameError] = useState('');
  
  // Initialize form with folder data or defaults
  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setSelectedDays(folder.recurrenceDays);
      
      // Determine preset based on selected days
      if (folder.recurrenceDays.length === 7) {
        setPreset('everyday');
      } else if (
        folder.recurrenceDays.length === 5 &&
        !folder.recurrenceDays.includes('saturday') &&
        !folder.recurrenceDays.includes('sunday')
      ) {
        setPreset('weekdays');
      } else if (
        folder.recurrenceDays.length === 2 &&
        folder.recurrenceDays.includes('saturday') &&
        folder.recurrenceDays.includes('sunday')
      ) {
        setPreset('weekends');
      } else {
        setPreset('custom');
      }
    } else {
      // Default values for new folder
      setName('');
      setSelectedDays(presetDays.weekdays);
      setPreset('weekdays');
    }
    
    setNameError('');
  }, [folder, visible]);
  
  // Handle day toggle
  const handleDayToggle = (day: Day) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(newSelectedDays);
    
    // Update preset if days match a preset
    if (newSelectedDays.length === 7) {
      setPreset('everyday');
    } else if (
      newSelectedDays.length === 5 &&
      !newSelectedDays.includes('saturday') &&
      !newSelectedDays.includes('sunday')
    ) {
      setPreset('weekdays');
    } else if (
      newSelectedDays.length === 2 &&
      newSelectedDays.includes('saturday') &&
      newSelectedDays.includes('sunday')
    ) {
      setPreset('weekends');
    } else {
      setPreset('custom');
    }
  };
  
  // Handle preset selection
  const handlePresetSelect = (newPreset: RecurrencePreset) => {
    setPreset(newPreset);
    setSelectedDays(presetDays[newPreset]);
  };
  
  // Handle save
  const handleSave = () => {
    // Validate
    if (!name.trim()) {
      setNameError('Folder name is required');
      return;
    }
    
    if (selectedDays.length === 0) {
      return; // At least one day should be selected
    }
    
    // Save folder
    onSave({
      name: name.trim(),
      recurrenceDays: selectedDays,
      isActive: folder ? folder.isActive : true,
    });
    
    onClose();
  };
  
  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>{folder ? 'Edit Folder' : 'New Folder'}</Text>
        
        <TextField
          label="Folder Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g., Work Mornings"
          error={nameError}
        />
        
        <DaySelector
          selectedDays={selectedDays}
          onDayToggle={handleDayToggle}
          onPresetSelect={handlePresetSelect}
          currentPreset={preset}
        />
        
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            variant="text"
            onPress={onClose}
            style={styles.cancelButton}
          />
          <Button
            title={folder ? 'Save' : 'Create'}
            variant="primary"
            onPress={handleSave}
            disabled={name.trim() === '' || selectedDays.length === 0}
          />
        </View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  cancelButton: {
    marginRight: spacing.md,
  },
});

export default FolderModal;