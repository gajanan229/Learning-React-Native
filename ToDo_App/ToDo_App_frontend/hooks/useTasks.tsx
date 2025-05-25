import { useEffect, useCallback } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskFilters } from '@/types/api';

export function useTasks(filters?: TaskFilters) {
  const store = useTaskStore();
  
  // Only fetch if we haven't fetched before and aren't currently loading
  useEffect(() => {
    if (store.lastFetch === null && !store.isLoading) {
      store.fetchTasks(filters);
    }
  }, [store.lastFetch, store.isLoading]); // Depend on store state instead
  
  // Memoize the refetch function
  const refetch = useCallback(() => {
    return store.fetchTasks(filters);
  }, []);
  
  return {
    // State
    tasks: store.tasks,
    isLoading: store.isLoading,
    error: store.error,
    lastFetch: store.lastFetch,
    
    // Actions
    createTask: store.createTask,
    updateTask: store.updateTask,
    deleteTask: store.deleteTask,
    toggleTask: store.toggleTaskCompletion,
    getTaskById: store.getTaskById,
    getTaskStats: store.getTaskStats,
    
    // Utility actions
    refetch,
    clearError: store.clearError,
    clearTasks: store.clearTasks,
  };
} 