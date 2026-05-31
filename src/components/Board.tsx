import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Column } from './Column';
import type { BoardState } from '../types';
import { PlusIcon, XIcon } from './icons';

interface Props {
  state: BoardState;
  query: string;
  onDragEnd: (result: DropResult) => void;
  onAddTask: (columnId: string, content: string) => void;
  onOpenTask: (taskId: string) => void;
  onDeleteTask: (taskId: string, columnId: string) => void;
  onAddColumn: (title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
}

export function Board({
  state,
  query,
  onDragEnd,
  onAddTask,
  onOpenTask,
  onDeleteTask,
  onAddColumn,
  onDeleteColumn,
  onRenameColumn,
}: Props) {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = normalizedQuery.length > 0;

  useEffect(() => {
    if (isAddingColumn && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingColumn]);

  function submitNewColumn() {
    const trimmed = newColumnTitle.trim();
    if (trimmed) onAddColumn(trimmed);
    setNewColumnTitle('');
    setIsAddingColumn(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') submitNewColumn();
    if (e.key === 'Escape') {
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Horizontally scrollable board surface */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        <Droppable droppableId="board" direction="horizontal" type="column">
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-4 p-6 h-full items-start min-w-max"
            >
              {state.columnOrder.map((colId, idx) => {
                const column = state.columns[colId];
                const tasks = column.taskIds
                  .map(id => state.tasks[id])
                  .filter((t): t is NonNullable<typeof t> => t !== undefined)
                  .filter(t =>
                    !isFiltering ||
                    t.content.toLowerCase().includes(normalizedQuery) ||
                    (t.description?.toLowerCase().includes(normalizedQuery) ?? false)
                  );

                return (
                  <Draggable key={colId} draggableId={colId} index={idx}>
                    {(dragProvided, dragSnapshot) => (
                      <Column
                        column={column}
                        tasks={tasks}
                        colorIndex={idx}
                        innerRef={dragProvided.innerRef}
                        draggableProps={dragProvided.draggableProps}
                        dragHandleProps={dragProvided.dragHandleProps}
                        isDragging={dragSnapshot.isDragging}
                        isFiltering={isFiltering}
                        onAddTask={onAddTask}
                        onOpenTask={onOpenTask}
                        onDeleteTask={onDeleteTask}
                        onDeleteColumn={onDeleteColumn}
                        onRenameColumn={onRenameColumn}
                      />
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}

              {/* ── Add Column ── */}
              {isAddingColumn ? (
                <div className="w-72 flex-shrink-0 rounded-2xl border border-white/10 bg-gray-900/70 backdrop-blur-xl p-4">
                  <input
                    ref={inputRef}
                    value={newColumnTitle}
                    onChange={e => setNewColumnTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter list title…"
                    className="w-full bg-transparent text-gray-100 font-semibold text-sm outline-none border-b border-gray-600 focus:border-blue-500 pb-1 mb-3 placeholder-gray-600 transition-colors"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={submitNewColumn}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Add list
                    </button>
                    <button
                      onClick={() => { setNewColumnTitle(''); setIsAddingColumn(false); }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
                      aria-label="Cancel"
                    >
                      <XIcon />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="flex-shrink-0 w-72 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-gray-200 transition-all duration-150 text-sm font-medium"
                >
                  <PlusIcon />
                  Add another list
                </button>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
