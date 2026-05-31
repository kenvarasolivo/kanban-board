import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '../types';
import { PRIORITY_META, describeDue } from '../lib/task';
import { CalendarIcon, DescriptionIcon, TrashIcon } from './icons';

interface Props {
  task: Task;
  index: number;
  columnId: string;
  onOpen: (taskId: string) => void;
  onDelete: (taskId: string, columnId: string) => void;
}

export function TaskCard({ task, index, columnId, onOpen, onDelete }: Props) {
  const priority = task.priority ? PRIORITY_META[task.priority] : null;
  const due = task.dueDate ? describeDue(task.dueDate) : null;
  const hasMeta = priority || due || task.description;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(task.id)}
          className={[
            'group relative overflow-hidden rounded-xl border bg-gray-800/90 p-3 pl-3.5 select-none transition-all duration-150',
            snapshot.isDragging
              ? 'border-blue-500/60 shadow-2xl shadow-black/70 rotate-[1.5deg] scale-[1.03]'
              : 'border-white/8 hover:border-white/20 hover:bg-gray-800 hover:shadow-lg hover:shadow-black/40 cursor-pointer',
          ].join(' ')}
        >
          {/* Priority accent bar */}
          {priority && (
            <span className={`absolute inset-y-0 left-0 w-1 ${priority.bar}`} />
          )}

          {/* Quick delete — revealed on hover */}
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDelete(task.id, columnId); }}
            className={[
              'absolute top-2 right-2 rounded-md p-1 text-gray-500 transition-all hover:bg-rose-500/20 hover:text-rose-400',
              snapshot.isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100',
            ].join(' ')}
            aria-label="Delete task"
          >
            <TrashIcon size={13} />
          </button>

          <p className="pr-6 text-sm leading-relaxed text-gray-100 whitespace-pre-wrap break-words">
            {task.content}
          </p>

          {/* Meta row: priority · due date · description indicator */}
          {hasMeta && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {priority && (
                <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${priority.badge}`}>
                  {priority.label}
                </span>
              )}
              {due && (
                <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${due.className}`}>
                  <CalendarIcon size={11} />
                  {due.label}
                </span>
              )}
              {task.description && (
                <span
                  className="inline-flex items-center text-gray-500"
                  title="This card has a description"
                >
                  <DescriptionIcon size={13} />
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
