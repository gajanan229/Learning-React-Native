// Backend API Response Types (snake_case from backend)
export interface BackendTask {
  id: number;
  user_id: number;
  folder_id: number | null;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendFolder {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

// Frontend Types (camelCase for frontend use)
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string; // ISO string
  folderId?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
  updatedAt?: number;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

// Task API Response Types
export interface TasksResponse {
  tasks: BackendTask[];
  total: number;
  filters?: TaskFilters;
}

export interface TaskResponse {
  task: BackendTask;
}

export interface TaskStatsResponse {
  overview: {
    total_count: number;
    completed_count: number;
    pending_count: number;
    completion_percentage: number;
  };
  byFolder: Array<{
    folder_id: number | null;
    folder_name: string | null;
    total_count: number;
    completed_count: number;
    pending_count: number;
  }>;
}

// Folder API Response Types
export interface FoldersResponse {
  folders: BackendFolder[];
  total: number;
}

export interface FolderResponse {
  folder: BackendFolder;
}

export interface DeleteFolderResponse {
  deletedFolder: BackendFolder;
  affectedTasks: number;
  message: string;
}

// Request Payload Types
export interface CreateTaskPayload {
  title: string;
  description?: string;
  folderId?: number | null;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  folderId?: number | null;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string | null;
}

export interface CreateFolderPayload {
  name: string;
}

export interface UpdateFolderPayload {
  name: string;
}

// Query Filter Types
export interface TaskFilters {
  folderId?: number | null;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  sortBy?: 'created_at' | 'due_date' | 'priority' | 'title' | 'updated_at';
  sortOrder?: 'ASC' | 'DESC';
}

// Error Types
export interface ApiError {
  success: false;
  message: string;
  error?: string;
} 