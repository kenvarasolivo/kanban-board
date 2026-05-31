import { useState, useRef, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import type { DraggableProvided, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import type { Column as ColumnType, Task } from '../types';
import { PencilIcon, PlusIcon, TrashIcon, XIcon, GripIcon } from './icons';

const ACCENT = [
  { dot: 'bg-cyan-400',    badge: 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30' },
  { dot: 'bg-amber-400',   badge: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30' },
  { dot: 'bg-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30' },
  { dot: 'bg-violet-400',  badge: 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30' },
  { dot: 'bg-rose-400',    badge: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30' },
  { dot: 'bg-orange-400',  badge: 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30' },
] as const;

interface Props {
  column: ColumnType;
  tasks: Task[];
  colorIndex: number;
  innerRef: DraggableProvided['innerRef'];
  draggableProps: DraggableProvided['draggableProps'];
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  isDragging: boolean;
  isFiltering: boolean;
  onAddTask: (columnId: string, content: string) => void;
  onOpenTask: (taskId: string) => void;
  onDeleteTask: (taskId: string, columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
}

export function Column({
  column,
  tasks,
  colorIndex,
  innerRef,
  draggableProps,
  dragHandleProps,
  isDragging,
  isFiltering,
  onAddTask,
  onOpenTask,
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
    <div
      ref={innerRef}
      {...draggableProps}
      className={[
        'relative isolate flex flex-col w-72 flex-shrink-0 rounded-2xl min-h-0 max-h-full border transition-shadow',
        isDragging ? 'border-white/20 shadow-2xl shadow-black/60' : 'border-white/8',
      ].join(' ')}
    >
      {/* Frosted-glass layer — kept as a non-ancestor sibling of the cards.
          backdrop-filter on a card ancestor would become the containing block
          for the dragged card's `position: fixed`, offsetting it from the cursor.
          `isolate` on the parent scopes this -z-10 layer to the column. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gray-900/70 backdrop-blur-xl"
      />

      {/* ── Column Header (drag handle) ── */}
      <div
        {...dragHandleProps}
        className="flex items-center gap-2 px-3 pt-3.5 pb-3 flex-shrink-0 cursor-grab active:cursor-grabbing"
      >
        <span className="flex-shrink-0 text-gray-600 group-hover:text-gray-400">
          <GripIcon />
        </span>
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
            className="flex-1 text-gray-100 font-semibold text-sm truncate"
          >
            {column.title}
          </h2>
        )}

        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${accent.badge}`}>
          {tasks.length}
        </span>

        <button
          onClick={() => { setTitleValue(column.title); setIsEditingTitle(true); }}
          className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 text-gray-600 hover:text-gray-300 transition-colors"
          aria-label="Rename column"
        >
          <PencilIcon />
        </button>
        <button
          onClick={() => onDeleteColumn(column.id)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-rose-500/20 text-gray-600 hover:text-rose-400 transition-colors"
          aria-label="Delete column"
        >
          <TrashIcon />
        </button>
      </div>

      <div className="mx-4 border-t border-white/8 flex-shrink-0" />

      {/* ── Task List (scrollable Droppable) ── */}
      <Droppable droppableId={column.id} type="task">
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
                onOpen={onOpenTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && (
              <p className="px-2 py-6 text-center text-xs text-gray-600 select-none">
                {isFiltering ? 'No matching cards' : 'No cards yet'}
              </p>
            )}
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
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Cancel"
              >
                <XIcon />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="mt-1 w-full flex items-center gap-2 px-2 py-2 rounded-xl text-gray-500 hover:text-gray-200 hover:bg-white/5 text-sm transition-colors"
          >
            <PlusIcon />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}
