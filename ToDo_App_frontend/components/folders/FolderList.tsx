import React from 'react';
import { View } from 'react-native';
import FolderItem from './FolderItem';
import { Folder } from '@/contexts/AppContext';

interface FolderListProps {
  folders: Folder[];
  getTaskCount: (folderId: string) => number;
  getCompletionCount: (folderId: string) => number;
}

export default function FolderList({ folders, getTaskCount, getCompletionCount }: FolderListProps) {
  // Sort folders by most recently created first
  const sortedFolders = [...folders].sort((a, b) => b.createdAt - a.createdAt);
  
  return (
    <View>
      {sortedFolders.map(folder => (
        <FolderItem 
          key={folder.id} 
          folder={folder} 
          taskCount={getTaskCount(folder.id)}
          completionCount={getCompletionCount(folder.id)}
        />
      ))}
    </View>
  );
}