import { useState, useEffect, useCallback } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import type { BoardState, Task, Column } from '../types';

const STORAGE_KEY = 'kanban-board-v1';

const DEFAULT_STATE: BoardState = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Design the database schema', createdAt: 1700000001000 },
    'task-2': { id: 'task-2', content: 'Set up CI/CD pipeline', createdAt: 1700000002000 },
    'task-3': { id: 'task-3', content: 'Write API documentation', createdAt: 1700000003000 },
    'task-4': { id: 'task-4', content: 'Implement authentication flow', createdAt: 1700000004000 },
    'task-5': { id: 'task-5', content: 'Deploy to staging environment', createdAt: 1700000005000 },
  },
  columns: {
    'col-1': { id: 'col-1', title: 'To Do', taskIds: ['task-1', 'task-2', 'task-3'] },
    'col-2': { id: 'col-2', title: 'In Progress', taskIds: ['task-4'] },
    'col-3': { id: 'col-3', title: 'Done', taskIds: ['task-5'] },
  },
  columnOrder: ['col-1', 'col-2', 'col-3'],
};

function loadFromStorage(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BoardState;
  } catch {
    // ignore parse errors, fall back to default
  }
  return DEFAULT_STATE;
}

export function useBoardState() {
  const [state, setState] = useState<BoardState>(loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    setState(prev => {
      const sourceCol = prev.columns[source.droppableId];
      const destCol = prev.columns[destination.droppableId];

      // Reorder within the same column
      if (sourceCol.id === destCol.id) {
        const newTaskIds = [...sourceCol.taskIds];
        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);
        return {
          ...prev,
          columns: {
            ...prev.columns,
            [sourceCol.id]: { ...sourceCol, taskIds: newTaskIds },
          },
        };
      }

      // Move between columns
      const sourceTaskIds = [...sourceCol.taskIds];
      sourceTaskIds.splice(source.index, 1);

      const destTaskIds = [...destCol.taskIds];
      destTaskIds.splice(destination.index, 0, draggableId);

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [sourceCol.id]: { ...sourceCol, taskIds: sourceTaskIds },
          [destCol.id]: { ...destCol, taskIds: destTaskIds },
        },
      };
    });
  }, []);

  const addTask = useCallback((columnId: string, content: string) => {
    const task: Task = {
      id: crypto.randomUUID(),
      content: content.trim(),
      createdAt: Date.now(),
    };
    setState(prev => ({
      ...prev,
      tasks: { ...prev.tasks, [task.id]: task },
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          taskIds: [...prev.columns[columnId].taskIds, task.id],
        },
      },
    }));
  }, []);

  const editTask = useCallback((taskId: string, content: string) => {
    setState(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: { ...prev.tasks[taskId], content: content.trim() },
      },
    }));
  }, []);

  const deleteTask = useCallback((taskId: string, columnId: string) => {
    setState(prev => {
      const tasks = { ...prev.tasks };
      delete tasks[taskId];
      return {
        ...prev,
        tasks,
        columns: {
          ...prev.columns,
          [columnId]: {
            ...prev.columns[columnId],
            taskIds: prev.columns[columnId].taskIds.filter(id => id !== taskId),
          },
        },
      };
    });
  }, []);

  const addColumn = useCallback((title: string) => {
    const column: Column = {
      id: crypto.randomUUID(),
      title: title.trim(),
      taskIds: [],
    };
    setState(prev => ({
      ...prev,
      columns: { ...prev.columns, [column.id]: column },
      columnOrder: [...prev.columnOrder, column.id],
    }));
  }, []);

  const deleteColumn = useCallback((columnId: string) => {
    setState(prev => {
      const col = prev.columns[columnId];
      const tasks = { ...prev.tasks };
      col.taskIds.forEach(id => delete tasks[id]);

      const columns = { ...prev.columns };
      delete columns[columnId];

      return {
        ...prev,
        tasks,
        columns,
        columnOrder: prev.columnOrder.filter(id => id !== columnId),
      };
    });
  }, []);

  const renameColumn = useCallback((columnId: string, title: string) => {
    setState(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: { ...prev.columns[columnId], title: title.trim() },
      },
    }));
  }, []);

  return {
    state,
    onDragEnd,
    addTask,
    editTask,
    deleteTask,
    addColumn,
    deleteColumn,
    renameColumn,
  };
}
