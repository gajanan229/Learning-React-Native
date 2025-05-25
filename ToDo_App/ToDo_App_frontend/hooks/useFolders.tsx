import { useEffect, useCallback } from 'react';
import { useFolderStore } from '@/store/useFolderStore';

export function useFolders() {
  const store = useFolderStore();
  
  // Only fetch if we haven't fetched before and aren't currently loading
  useEffect(() => {
    if (store.lastFetch === null && !store.isLoading) {
      store.fetchFolders();
    }
  }, [store.lastFetch, store.isLoading]); // Depend on store state instead
  
  // Memoize the refetch function
  const refetch = useCallback(() => {
    return store.fetchFolders();
  }, []);
  
  return {
    // State
    folders: store.folders,
    isLoading: store.isLoading,
    error: store.error,
    lastFetch: store.lastFetch,
    
    // Actions
    createFolder: store.createFolder,
    updateFolder: store.updateFolder,
    deleteFolder: store.deleteFolder,
    getFolderById: store.getFolderById,
    
    // Utility actions
    refetch,
    clearError: store.clearError,
    clearFolders: store.clearFolders,
  };
} 