import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  folderId?: string;
  createdAt: number;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

interface AppContextProps {
  tasks: Task[];
  folders: Folder[];
  addTask: (title: string, folderId?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addFolder: (name: string) => void;
  updateFolder: (id: string, name: string) => void;
  deleteFolder: (id: string, deleteOption: 'keep' | 'delete') => void;
  isModalVisible: boolean;
  modalType: 'task' | 'folder' | 'delete-folder' | null;
  currentFolderId?: string;
  currentItem?: Task | Folder | null;
  showModal: (type: 'task' | 'folder' | 'delete-folder', item?: Task | Folder | null, folderId?: string) => void;
  hideModal: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'task' | 'folder' | 'delete-folder' | null>(null);
  const [currentItem, setCurrentItem] = useState<Task | Folder | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);

  // Load data from storage on initial load
  useEffect(() => {
    const loadData = async () => {
      try {
        const tasksData = await AsyncStorage.getItem('tasks');
        const foldersData = await AsyncStorage.getItem('folders');
        
        if (tasksData) {
          setTasks(JSON.parse(tasksData));
        }
        
        if (foldersData) {
          setFolders(JSON.parse(foldersData));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Save tasks to storage whenever they change
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    };
    
    saveData();
  }, [tasks]);

  // Save folders to storage whenever they change
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('folders', JSON.stringify(folders));
      } catch (error) {
        console.error('Error saving folders:', error);
      }
    };
    
    saveData();
  }, [folders]);

  // Add a new task
  const addTask = (title: string, folderId?: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      folderId,
      createdAt: Date.now()
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  // Update an existing task
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  // Toggle task completion
  const toggleTask = (id: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Add a new folder
  const addFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now()
    };
    
    setFolders(prevFolders => [...prevFolders, newFolder]);
  };

  // Update a folder
  const updateFolder = (id: string, name: string) => {
    setFolders(prevFolders => 
      prevFolders.map(folder => 
        folder.id === id ? { ...folder, name } : folder
      )
    );
  };

  // Delete a folder with option to keep or delete its tasks
  const deleteFolder = (id: string, deleteOption: 'keep' | 'delete') => {
    // Remove the folder
    setFolders(prevFolders => prevFolders.filter(folder => folder.id !== id));
    
    // Handle the tasks based on the delete option
    if (deleteOption === 'delete') {
      // Delete all tasks in this folder
      setTasks(prevTasks => prevTasks.filter(task => task.folderId !== id));
    } else {
      // Move tasks to ungrouped
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.folderId === id ? { ...task, folderId: undefined } : task
        )
      );
    }
  };

  // Show modal with specified type and optional item
  const showModal = (type: 'task' | 'folder' | 'delete-folder', item?: Task | Folder | null, folderId?: string) => {
    setModalType(type);
    setCurrentItem(item || null);
    setCurrentFolderId(folderId);
    setIsModalVisible(true);
  };

  // Hide modal
  const hideModal = () => {
    setIsModalVisible(false);
    setModalType(null);
    setCurrentItem(null);
    setCurrentFolderId(undefined);
  };

  const contextValue: AppContextProps = {
    tasks,
    folders,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    addFolder,
    updateFolder,
    deleteFolder,
    isModalVisible,
    modalType,
    currentItem,
    currentFolderId,
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