import React, { createContext, useContext, ReactNode } from 'react';
import { Task, Folder } from '@/types/api';
import { useTasks } from '@/hooks/useTasks';
import { useFolders } from '@/hooks/useFolders';

// Re-export types for backwards compatibility
export type { Task, Folder };

interface AppContextProps {
  // Data
  tasks: Task[];
  folders: Folder[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Task operations
  addTask: (title: string, folderId?: string, description?: string, priority?: 'high' | 'medium' | 'low', dueDate?: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  
  // Folder operations
  addFolder: (name: string) => Promise<void>;
  updateFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string, deleteOption?: 'keep' | 'delete') => Promise<void>;
  
  // Utility
  refetch: () => Promise<void>;
  clearError: () => void;
  
  // Legacy modal support (deprecated - will be removed in future versions)
  isModalVisible: boolean;
  modalType: 'task' | 'folder' | 'delete-folder' | null;
  currentFolderId?: string;
  currentItem?: Task | Folder | null;
  showModal: (type: 'task' | 'folder' | 'delete-folder', item?: Task | Folder | null, folderId?: string) => void;
  hideModal: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  // Use the new backend-integrated hooks
  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask: updateTaskHook,
    deleteTask: deleteTaskHook,
    toggleTask: toggleTaskHook,
    refetch: refetchTasks,
    clearError: clearTasksError
  } = useTasks();

  const {
    folders,
    isLoading: foldersLoading,
    error: foldersError,
    createFolder,
    updateFolder: updateFolderHook,
    deleteFolder: deleteFolderHook,
    refetch: refetchFolders,
    clearError: clearFoldersError
  } = useFolders();

  // Combine loading states and errors
  const isLoading = tasksLoading || foldersLoading;
  const error = tasksError || foldersError;

  // Legacy modal state (deprecated)
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [modalType, setModalType] = React.useState<'task' | 'folder' | 'delete-folder' | null>(null);
  const [currentItem, setCurrentItem] = React.useState<Task | Folder | null>(null);
  const [currentFolderId, setCurrentFolderId] = React.useState<string | undefined>(undefined);

  // Wrapper functions to maintain API compatibility
  const addTask = async (title: string, folderId?: string, description?: string, priority?: 'high' | 'medium' | 'low', dueDate?: string) => {
    const createData: any = {
      title,
      description,
      priority,
      dueDate
    };
    
    if (folderId) {
      createData.folderId = folderId;
    }
    
    await createTask(createData);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    // Convert updates to match API expectations
    const updateData: any = { ...updates };
    if (updateData.folderId !== undefined) {
      // Handle folderId conversion if needed
      updateData.folderId = updateData.folderId || undefined;
    }
    
    await updateTaskHook(id, updateData);
  };

  const deleteTask = async (id: string) => {
    await deleteTaskHook(id);
  };

  const toggleTask = async (id: string) => {
    await toggleTaskHook(id);
  };

  const addFolder = async (name: string) => {
    await createFolder({ name });
  };

  const updateFolder = async (id: string, name: string) => {
    await updateFolderHook(id, { name });
  };

  const deleteFolder = async (id: string, deleteOption: 'keep' | 'delete' = 'keep') => {
    // Note: The backend handles this automatically
    await deleteFolderHook(id);
  };

  const refetch = async () => {
    await Promise.all([refetchTasks(), refetchFolders()]);
  };

  const clearError = () => {
    clearTasksError();
    clearFoldersError();
  };

  // Legacy modal functions (deprecated)
  const showModal = (type: 'task' | 'folder' | 'delete-folder', item?: Task | Folder | null, folderId?: string) => {
    console.warn('showModal is deprecated. Please use the new Create screens instead.');
    setModalType(type);
    setCurrentItem(item || null);
    setCurrentFolderId(folderId);
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
    setModalType(null);
    setCurrentItem(null);
    setCurrentFolderId(undefined);
  };

  const contextValue: AppContextProps = {
    // Data
    tasks,
    folders,
    
    // Loading states
    isLoading,
    error,
    
    // Task operations
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    
    // Folder operations
    addFolder,
    updateFolder,
    deleteFolder,
    
    // Utility
    refetch,
    clearError,
    
    // Legacy modal support (deprecated)
    isModalVisible,
    modalType,
    currentFolderId,
    currentItem,
    showModal,
    hideModal
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};