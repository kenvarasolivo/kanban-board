import { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '../types';

interface Props {
  task: Task;
  index: number;
  columnId: string;
  onEdit: (taskId: string, content: string) => void;
  onDelete: (taskId: string, columnId: string) => void;
}

export function TaskCard({ task, index, columnId, onEdit, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  function startEdit() {
    setEditValue(task.content);
    setIsEditing(true);
  }

  function saveEdit() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.content) {
      onEdit(task.id, trimmed);
    }
    setIsEditing(false);
  }

  function cancelEdit() {
    setEditValue(task.content);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={[
            'group relative bg-gray-800 border rounded-xl p-3 select-none transition-all duration-150',
            snapshot.isDragging
              ? 'border-blue-500 shadow-2xl shadow-black/70 rotate-1 scale-105 opacity-95'
              : 'border-gray-700 hover:border-gray-500 hover:shadow-md hover:shadow-black/40 cursor-grab active:cursor-grabbing',
          ].join(' ')}
        >
          {!isEditing ? (
            <>
              {/* Action buttons — revealed on hover */}
              <div
                className={[
                  'absolute top-2 right-2 flex gap-1 transition-opacity duration-150',
                  snapshot.isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100',
                ].join(' ')}
              >
                <button
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); startEdit(); }}
                  className="p-1 rounded-md hover:bg-gray-600 text-gray-500 hover:text-gray-200 transition-colors"
                  aria-label="Edit task"
                >
                  <PencilIcon />
                </button>
                <button
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onDelete(task.id, columnId); }}
                  className="p-1 rounded-md hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                  aria-label="Delete task"
                >
                  <TrashIcon />
                </button>
              </div>
              <p className="text-gray-100 text-sm leading-relaxed pr-14 whitespace-pre-wrap break-words">
                {task.content}
              </p>
            </>
          ) : (
            <div onClick={e => e.stopPropagation()}>
              <textarea
                ref={textareaRef}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                className="w-full bg-transparent text-gray-100 text-sm leading-relaxed resize-none outline-none"
              />
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-700">
                <button
                  onClick={saveEdit}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700 text-xs rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

function PencilIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
