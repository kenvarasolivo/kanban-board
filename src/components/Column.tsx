import { useState, useRef, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import type { Column as ColumnType, Task } from '../types';

const ACCENT = [
  { dot: 'bg-cyan-400',    badge: 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30' },
  { dot: 'bg-amber-400',   badge: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30' },
  { dot: 'bg-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30' },
  { dot: 'bg-violet-400',  badge: 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30' },
  { dot: 'bg-rose-400',    badge: 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30' },
  { dot: 'bg-orange-400',  badge: 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/30' },
] as const;

interface Props {
  column: ColumnType;
  tasks: Task[];
  colorIndex: number;
  onAddTask: (columnId: string, content: string) => void;
  onEditTask: (taskId: string, content: string) => void;
  onDeleteTask: (taskId: string, columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
}

export function Column({
  column,
  tasks,
  colorIndex,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDeleteColumn,
  onRenameColumn,
}: Props) {
  const accent = ACCENT[colorIndex % ACCENT.length];

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(column.title);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardContent, setNewCardContent] = useState('');

  const titleInputRef = useRef<HTMLInputElement>(null);
  const newCardRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isAddingCard && newCardRef.current) {
      newCardRef.current.focus();
    }
  }, [isAddingCard]);

  function saveTitle() {
    const trimmed = titleValue.trim();
    if (trimmed) {
      onRenameColumn(column.id, trimmed);
    } else {
      setTitleValue(column.title);
    }
    setIsEditingTitle(false);
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') saveTitle();
    if (e.key === 'Escape') {
      setTitleValue(column.title);
      setIsEditingTitle(false);
    }
  }

  function submitNewCard() {
    const trimmed = newCardContent.trim();
    if (trimmed) onAddTask(column.id, trimmed);
    setNewCardContent('');
    setIsAddingCard(false);
  }

  function handleCardKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitNewCard();
    }
    if (e.key === 'Escape') {
      setNewCardContent('');
      setIsAddingCard(false);
    }
  }

  return (
    <div className="flex flex-col w-72 flex-shrink-0 bg-gray-900 rounded-2xl min-h-0 max-h-full">
      {/* ── Column Header ── */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 flex-shrink-0">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${accent.dot}`} />

        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            value={titleValue}
            onChange={e => setTitleValue(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={handleTitleKeyDown}
            className="flex-1 bg-transparent text-gray-100 font-semibold text-sm outline-none border-b border-gray-500 focus:border-blue-500 pb-px transition-colors"
          />
        ) : (
          <h2
            onDoubleClick={() => { setTitleValue(column.title); setIsEditingTitle(true); }}
            title={column.title}
            className="flex-1 text-gray-100 font-semibold text-sm truncate cursor-default"
          >
            {column.title}
          </h2>
        )}

        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${accent.badge}`}>
          {tasks.length}
        </span>

        <button
          onClick={() => { setTitleValue(column.title); setIsEditingTitle(true); }}
          className="flex-shrink-0 p-1 rounded-md hover:bg-gray-700 text-gray-600 hover:text-gray-300 transition-colors"
          aria-label="Rename column"
        >
          <PencilIcon />
        </button>
        <button
          onClick={() => onDeleteColumn(column.id)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors"
          aria-label="Delete column"
        >
          <TrashIcon />
        </button>
      </div>

      <div className="mx-4 border-t border-gray-800 flex-shrink-0" />

      {/* ── Task List (scrollable Droppable) ── */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={[
              'flex flex-col gap-2 px-3 py-3 overflow-y-auto min-h-[80px] flex-1 rounded-xl transition-colors duration-150',
              snapshot.isDraggingOver ? 'bg-blue-500/5' : '',
            ].join(' ')}
          >
            {tasks.map((task, idx) => (
              <TaskCard
                key={task.id}
                task={task}
                index={idx}
                columnId={column.id}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* ── Add Card Section ── */}
      <div className="px-3 pb-3 flex-shrink-0">
        {isAddingCard ? (
          <div className="mt-1">
            <textarea
              ref={newCardRef}
              value={newCardContent}
              onChange={e => setNewCardContent(e.target.value)}
              onKeyDown={handleCardKeyDown}
              placeholder="Enter a title for this card…"
              rows={3}
              className="w-full bg-gray-800 border border-blue-500 rounded-xl px-3 py-2.5 text-gray-100 text-sm resize-none outline-none placeholder-gray-600 leading-relaxed"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={submitNewCard}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Add card
              </button>
              <button
                onClick={() => { setNewCardContent(''); setIsAddingCard(false); }}
                className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Cancel"
              >
                <XIcon />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="mt-1 w-full flex items-center gap-2 px-2 py-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-gray-800 text-sm transition-colors"
          >
            <PlusIcon />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
