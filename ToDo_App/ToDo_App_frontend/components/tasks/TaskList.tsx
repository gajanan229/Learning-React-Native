import React from 'react';
import { View, Text, Animated } from 'react-native';
import TaskItem from './TaskItem';
import { Task } from '@/types/api';

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  // Enhanced sorting: priority, due date, completion status, then creation date
  const sortedTasks = [...tasks].sort((a, b) => {
    // First sort by completion status (incomplete tasks first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // If both are incomplete, sort by priority (high > medium > low > none)
    if (!a.completed && !b.completed) {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = a.priority ? priorityOrder[a.priority] : 0;
      const bPriority = b.priority ? priorityOrder[b.priority] : 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // Then sort by due date (soonest first, tasks without due dates last)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
    }
    
    // Finally sort by created date (newest first)
    return b.createdAt - a.createdAt;
  });
  
  return (
    <View>
      {sortedTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </View>
  );
}