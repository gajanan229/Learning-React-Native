import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { Folder } from '../../types';
import { colors, typography, spacing } from '../../constants/theme';
import FolderCard from './FolderCard';
import SwipeableRow from '../ui/SwipeableRow';

interface FolderListProps {
  folders: Folder[];
  onFolderPress: (folder: Folder) => void;
  onFolderToggle: (folderId: string) => void;
  onFolderEdit: (folder: Folder) => void;
  onFolderDelete: (folderId: string) => void;
}

const FolderList: React.FC<FolderListProps> = ({
  folders,
  onFolderPress,
  onFolderToggle,
  onFolderEdit,
  onFolderDelete,
}) => {
  // Render an empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No alarm folders yet.</Text>
      <Text style={styles.emptySubtitle}>Tap '+ Folder' to create one.</Text>
    </View>
  );

  // Render a folder item
  const renderFolder = ({ item }: { item: Folder }) => (
    <SwipeableRow
      onEdit={() => onFolderEdit(item)}
      onDelete={() => onFolderDelete(item.id)}
    >
      <FolderCard
        folder={item}
        onPress={() => onFolderPress(item)}
        onToggle={() => onFolderToggle(item.id)}
      />
    </SwipeableRow>
  );

  return (
    <FlatList
      data={folders}
      renderItem={renderFolder}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmptyState}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
});

export default FolderList;