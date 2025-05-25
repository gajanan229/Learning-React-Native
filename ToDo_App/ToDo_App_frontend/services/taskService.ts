import todoApiClient from './ToDoApiClient';
import {
  BackendTask,
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilters,
  ApiResponse,
  TasksResponse,
  TaskResponse,
  TaskStatsResponse,
} from '@/types/api';

// Utility function to map backend task to frontend task
const mapBackendTaskToFrontendTask = (backendTask: BackendTask): Task => {
  return {
    id: String(backendTask.id),
    title: backendTask.title,
    description: backendTask.description || undefined,
    completed: backendTask.completed,
    priority: backendTask.priority,
    dueDate: backendTask.due_date || undefined,
    folderId: backendTask.folder_id ? String(backendTask.folder_id) : undefined,
    createdAt: new Date(backendTask.created_at).getTime(),
    updatedAt: new Date(backendTask.updated_at).getTime(),
  };
};

// Utility function to map frontend payload to backend payload
const mapCreateTaskPayload = (payload: CreateTaskPayload & { folderId?: string }) => {
  return {
    title: payload.title,
    description: payload.description || undefined,
    folderId: payload.folderId ? parseInt(payload.folderId) : null,
    priority: payload.priority || 'medium',
    dueDate: payload.dueDate || undefined,
  };
};

const mapUpdateTaskPayload = (payload: UpdateTaskPayload & { folderId?: string | null }) => {
  const mapped: any = {};
  
  if (payload.title !== undefined) mapped.title = payload.title;
  if (payload.description !== undefined) mapped.description = payload.description;
  if (payload.completed !== undefined) mapped.completed = payload.completed;
  if (payload.priority !== undefined) mapped.priority = payload.priority;
  if (payload.dueDate !== undefined) mapped.dueDate = payload.dueDate;
  if (payload.folderId !== undefined) {
    mapped.folderId = payload.folderId ? parseInt(payload.folderId) : null;
  }
  
  return mapped;
};

/**
 * Fetches all tasks for the authenticated user with optional filters
 */
export const getTasksAPI = async (filters?: TaskFilters): Promise<Task[]> => {
  try {
    const params: any = {};
    
    if (filters) {
      if (filters.folderId !== undefined) {
        params.folderId = filters.folderId;
      }
      if (filters.completed !== undefined) {
        params.completed = filters.completed;
      }
      if (filters.priority) {
        params.priority = filters.priority;
      }
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
      }
      if (filters.sortOrder) {
        params.sortOrder = filters.sortOrder;
      }
    }
    
    const response = await todoApiClient.get<ApiResponse<TasksResponse>>('/tasks', { params });
    return response.data.data.tasks.map(mapBackendTaskToFrontendTask);
  } catch (error) {
    console.error('Error in getTasksAPI:', error);
    throw error;
  }
};

/**
 * Fetches a single task by its ID
 */
export const getTaskByIdAPI = async (taskId: string): Promise<Task> => {
  try {
    const response = await todoApiClient.get<ApiResponse<TaskResponse>>(`/tasks/${taskId}`);
    return mapBackendTaskToFrontendTask(response.data.data.task);
  } catch (error) {
    console.error(`Error in getTaskByIdAPI for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Creates a new task
 */
export const createTaskAPI = async (taskData: CreateTaskPayload & { folderId?: string }): Promise<Task> => {
  try {
    const payload = mapCreateTaskPayload(taskData);
    console.log('Creating task with payload:', payload);
    const response = await todoApiClient.post<ApiResponse<TaskResponse>>('/tasks', payload);
    return mapBackendTaskToFrontendTask(response.data.data.task);
  } catch (error) {
    console.error('Error in createTaskAPI:', error);
    throw error;
  }
};

/**
 * Updates an existing task
 */
export const updateTaskAPI = async (taskId: string, updates: UpdateTaskPayload & { folderId?: string | null }): Promise<Task> => {
  try {
    const payload = mapUpdateTaskPayload(updates);
    console.log(`Updating task ${taskId} with payload:`, payload);
    const response = await todoApiClient.put<ApiResponse<TaskResponse>>(`/tasks/${taskId}`, payload);
    return mapBackendTaskToFrontendTask(response.data.data.task);
  } catch (error) {
    console.error(`Error in updateTaskAPI for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Toggles task completion status
 */
export const toggleTaskCompletionAPI = async (taskId: string): Promise<Task> => {
  try {
    const response = await todoApiClient.put<ApiResponse<TaskResponse>>(`/tasks/${taskId}/toggle`);
    return mapBackendTaskToFrontendTask(response.data.data.task);
  } catch (error) {
    console.error(`Error in toggleTaskCompletionAPI for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Deletes a task by its ID
 */
export const deleteTaskAPI = async (taskId: string): Promise<void> => {
  try {
    await todoApiClient.delete(`/tasks/${taskId}`);
    // Backend returns success response with deleted task info, but we don't need it
  } catch (error) {
    console.error(`Error in deleteTaskAPI for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Fetches task statistics for the authenticated user
 */
export const getTaskStatsAPI = async (): Promise<TaskStatsResponse> => {
  try {
    const response = await todoApiClient.get<ApiResponse<TaskStatsResponse>>('/tasks/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error in getTaskStatsAPI:', error);
    throw error;
  }
}; 