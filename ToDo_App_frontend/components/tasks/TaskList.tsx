import React from 'react';
import { View, Text, Animated } from 'react-native';
import TaskItem from './TaskItem';
import { Task } from '@/contexts/AppContext';

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  // Sort tasks: active tasks first, then completed tasks, with most recent first in each group
  const sortedTasks = [...tasks].sort((a, b) => {
    // First sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Then sort by created date (newest first)
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