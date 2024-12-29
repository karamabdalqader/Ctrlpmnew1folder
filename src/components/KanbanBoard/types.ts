// KanbanBoard types
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  status: 'todo' | 'inProgress' | 'done';
  assignedTo?: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

// Ensure this is treated as a module
export {};
