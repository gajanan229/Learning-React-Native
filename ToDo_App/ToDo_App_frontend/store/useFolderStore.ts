import { create } from 'zustand';
import {
  Folder,
  CreateFolderPayload,
  UpdateFolderPayload,
  DeleteFolderResponse,
} from '@/types/api';
import {
  getFoldersAPI,
  getFolderByIdAPI,
  createFolderAPI,
  updateFolderAPI,
  deleteFolderAPI,
} from '@/services/folderService';

interface FolderStore {
  // State
  folders: Folder[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Actions
  fetchFolders: () => Promise<void>;
  createFolder: (folderData: CreateFolderPayload) => Promise<Folder>;
  updateFolder: (folderId: string, updates: UpdateFolderPayload) => Promise<Folder>;
  deleteFolder: (folderId: string) => Promise<DeleteFolderResponse>;
  getFolderById: (folderId: string) => Folder | undefined;
  clearError: () => void;
  clearFolders: () => void;
}

export const useFolderStore = create<FolderStore>((set, get) => ({
  // Initial State
  folders: [],
  isLoading: false,
  error: null,
  lastFetch: null,

  // Fetch all folders
  fetchFolders: async () => {
    set({ isLoading: true, error: null });
    try {
      const folders = await getFoldersAPI();
      set({ 
        folders, 
        isLoading: false, 
        lastFetch: Date.now() 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch folders';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  // Create a new folder
  createFolder: async (folderData) => {
    set({ isLoading: true, error: null });
    try {
      const newFolder = await createFolderAPI(folderData);
      
      // Add the new folder to the current folders array
      set(state => ({ 
        folders: [...state.folders, newFolder],
        isLoading: false 
      }));
      
      return newFolder;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create folder';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  // Update an existing folder
  updateFolder: async (folderId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedFolder = await updateFolderAPI(folderId, updates);
      
      // Update the folder in the current folders array
      set(state => ({
        folders: state.folders.map(folder => 
          folder.id === folderId ? updatedFolder : folder
        ),
        isLoading: false
      }));
      
      return updatedFolder;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update folder';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete a folder
  deleteFolder: async (folderId) => {
    set({ isLoading: true, error: null });
    try {
      const deleteResponse = await deleteFolderAPI(folderId);
      
      // Remove the folder from the current folders array
      set(state => ({
        folders: state.folders.filter(folder => folder.id !== folderId),
        isLoading: false
      }));
      
      return deleteResponse;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete folder';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  // Get a folder by ID from current state
  getFolderById: (folderId) => {
    return get().folders.find(folder => folder.id === folderId);
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Clear all folders (useful for logout)
  clearFolders: () => {
    set({ 
      folders: [], 
      isLoading: false, 
      error: null, 
      lastFetch: null 
    });
  },
})); 