export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  content: string;
  description?: string;
  priority?: Priority;
  /** ISO date string (YYYY-MM-DD) */
  dueDate?: string;
  createdAt: number;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface BoardState {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}
