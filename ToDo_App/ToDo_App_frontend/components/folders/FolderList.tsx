import React from 'react';
import { View } from 'react-native';
import FolderItem from './FolderItem';
import { Folder } from '@/types/api';

interface FolderListProps {
  folders: Folder[];
  getTaskCount: (folderId: string) => number;
  getCompletionCount: (folderId: string) => number;
}

export default function FolderList({ folders, getTaskCount, getCompletionCount }: FolderListProps) {
  // Enhanced sorting: by task count (descending), then by creation date (newest first)
  const sortedFolders = [...folders].sort((a, b) => {
    const aTaskCount = getTaskCount(a.id);
    const bTaskCount = getTaskCount(b.id);
    
    // Sort by task count first (folders with more tasks first)
    if (aTaskCount !== bTaskCount) {
      return bTaskCount - aTaskCount;
    }
    
    // Then sort by most recently created first
    return b.createdAt - a.createdAt;
  });
  
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