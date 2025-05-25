import { create } from 'zustand';
import {
  Task,
  TaskFilters,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskStatsResponse,
} from '@/types/api';
import {
  getTasksAPI,
  getTaskByIdAPI,
  createTaskAPI,
  updateTaskAPI,
  deleteTaskAPI,
  toggleTaskCompletionAPI,
  getTaskStatsAPI,
} from '@/services/taskService';

interface TaskStore {
  // State
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Actions
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  createTask: (taskData: CreateTaskPayload & { folderId?: string }) => Promise<Task>;
  updateTask: (taskId: string, updates: UpdateTaskPayload & { folderId?: string | null }) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<Task>;
  getTaskById: (taskId: string) => Task | undefined;
  getTaskStats: () => Promise<TaskStatsResponse>;
  clearError: () => void;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial State
  tasks: [],
  isLoading: false,
  error: null,
  lastFetch: null,

  // Fetch all tasks with optional filters
  fetchTasks: async (filters?: TaskFilters) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await getTasksAPI(filters);
      set({ 
        tasks, 
        isLoading: false, 
        lastFetch: Date.now() 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch tasks';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await createTaskAPI(taskData);
      
      // Add the new task to the current tasks array
      set(state => ({ 
        tasks: [...state.tasks, newTask],
        isLoading: false 
      }));
      
      return newTask;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create task';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  // Update an existing task
  updateTask: async (taskId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await updateTaskAPI(taskId, updates);
      
      // Update the task in the current tasks array
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? updatedTask : task
        ),
        isLoading: false
      }));
      
      return updatedTask;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update task';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTaskAPI(taskId);
      
      // Remove the task from the current tasks array
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== taskId),
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete task';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  // Toggle task completion status
  toggleTaskCompletion: async (taskId) => {
    // Optimistic update
    const currentTasks = get().tasks;
    const taskToUpdate = currentTasks.find(task => task.id === taskId);
    
    if (taskToUpdate) {
      // Update UI immediately
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId 
            ? { ...task, completed: !task.completed }
            : task
        )
      }));
    }

    try {
      const updatedTask = await toggleTaskCompletionAPI(taskId);
      
      // Update with server response
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? updatedTask : task
        ),
        error: null
      }));
      
      return updatedTask;
    } catch (error: any) {
      // Revert optimistic update on error
      if (taskToUpdate) {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId ? taskToUpdate : task
          )
        }));
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to toggle task completion';
      set({ error: errorMessage });
      throw error;
    }
  },

  // Get a task by ID from current state
  getTaskById: (taskId) => {
    return get().tasks.find(task => task.id === taskId);
  },

  // Get task statistics
  getTaskStats: async () => {
    try {
      const stats = await getTaskStatsAPI();
      return stats;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch task statistics';
      set({ error: errorMessage });
      throw error;
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Clear all tasks (useful for logout)
  clearTasks: () => {
    set({ 
      tasks: [], 
      isLoading: false, 
      error: null, 
      lastFetch: null 
    });
  },
})); 