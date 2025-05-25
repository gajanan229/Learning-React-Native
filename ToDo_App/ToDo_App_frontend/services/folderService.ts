import todoApiClient from './ToDoApiClient';
import {
  BackendFolder,
  Folder,
  CreateFolderPayload,
  UpdateFolderPayload,
  ApiResponse,
  FoldersResponse,
  FolderResponse,
  DeleteFolderResponse,
} from '@/types/api';

// Utility function to map backend folder to frontend folder
const mapBackendFolderToFrontendFolder = (backendFolder: BackendFolder): Folder => {
  return {
    id: String(backendFolder.id),
    name: backendFolder.name,
    createdAt: new Date(backendFolder.created_at).getTime(),
    updatedAt: new Date(backendFolder.updated_at).getTime(),
  };
};

/**
 * Fetches all folders for the authenticated user
 */
export const getFoldersAPI = async (): Promise<Folder[]> => {
  try {
    const response = await todoApiClient.get<ApiResponse<FoldersResponse>>('/folders');
    return response.data.data.folders.map(mapBackendFolderToFrontendFolder);
  } catch (error) {
    console.error('Error in getFoldersAPI:', error);
    throw error;
  }
};

/**
 * Fetches a single folder by its ID
 */
export const getFolderByIdAPI = async (folderId: string): Promise<Folder> => {
  try {
    const response = await todoApiClient.get<ApiResponse<FolderResponse>>(`/folders/${folderId}`);
    return mapBackendFolderToFrontendFolder(response.data.data.folder);
  } catch (error) {
    console.error(`Error in getFolderByIdAPI for folder ${folderId}:`, error);
    throw error;
  }
};

/**
 * Creates a new folder
 */
export const createFolderAPI = async (folderData: CreateFolderPayload): Promise<Folder> => {
  try {
    console.log('Creating folder with payload:', folderData);
    const response = await todoApiClient.post<ApiResponse<FolderResponse>>('/folders', folderData);
    return mapBackendFolderToFrontendFolder(response.data.data.folder);
  } catch (error) {
    console.error('Error in createFolderAPI:', error);
    throw error;
  }
};

/**
 * Updates an existing folder
 */
export const updateFolderAPI = async (folderId: string, updates: UpdateFolderPayload): Promise<Folder> => {
  try {
    console.log(`Updating folder ${folderId} with payload:`, updates);
    const response = await todoApiClient.put<ApiResponse<FolderResponse>>(`/folders/${folderId}`, updates);
    return mapBackendFolderToFrontendFolder(response.data.data.folder);
  } catch (error) {
    console.error(`Error in updateFolderAPI for folder ${folderId}:`, error);
    throw error;
  }
};

/**
 * Deletes a folder by its ID
 */
export const deleteFolderAPI = async (folderId: string): Promise<DeleteFolderResponse> => {
  try {
    const response = await todoApiClient.delete<ApiResponse<DeleteFolderResponse>>(`/folders/${folderId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error in deleteFolderAPI for folder ${folderId}:`, error);
    throw error;
  }
}; 