import { useEffect, useState } from 'react';
import type { Priority, Task } from '../types';
import { PRIORITY_META, PRIORITY_ORDER } from '../lib/task';
import { CalendarIcon, DescriptionIcon, FlagIcon, TrashIcon, XIcon } from './icons';

interface Props {
  task: Task;
  columnId: string;
  columnTitle: string;
  onUpdate: (taskId: string, patch: Partial<Task>) => void;
  onDelete: (taskId: string, columnId: string) => void;
  onClose: () => void;
}

export function CardModal({ task, columnId, columnTitle, onUpdate, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(task.content);
  const [description, setDescription] = useState(task.description ?? '');

  // Commit text edits when the field loses focus or the modal closes.
  function commitTitle() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.content) onUpdate(task.id, { content: trimmed });
    else if (!trimmed) setTitle(task.content);
  }

  function commitDescription() {
    const trimmed = description.trim();
    if (trimmed !== (task.description ?? '')) {
      onUpdate(task.id, { description: trimmed || undefined });
    }
  }

  function setPriority(p: Priority | undefined) {
    onUpdate(task.id, { priority: p });
  }

  function setDueDate(value: string) {
    onUpdate(task.id, { dueDate: value || undefined });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const created = new Date(task.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-8 animate-[fadeIn_120ms_ease-out]"
    >
      <div
        onMouseDown={e => e.stopPropagation()}
        className="w-full max-w-lg my-auto rounded-2xl border border-white/10 bg-gray-900/95 shadow-2xl shadow-black/60 animate-[popIn_140ms_ease-out]"
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-3">
          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={commitTitle}
            rows={1}
            className="flex-1 resize-none bg-transparent text-lg font-semibold text-gray-50 outline-none leading-snug"
          />
          <button
            onClick={onClose}
            className="mt-1 flex-shrink-0 rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <XIcon size={18} />
          </button>
        </div>
        <p className="px-5 -mt-1 pb-4 text-xs text-gray-500">
          in <span className="text-gray-400">{columnTitle}</span> · created {created}
        </p>

        <div className="mx-5 border-t border-white/10" />

        {/* Priority */}
        <section className="px-5 pt-4">
          <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <FlagIcon size={12} /> Priority
          </label>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_ORDER.map(p => {
              const meta = PRIORITY_META[p];
              const active = task.priority === p;
              return (
                <button
                  key={p}
                  onClick={() => setPriority(active ? undefined : p)}
                  className={[
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    active
                      ? meta.badge
                      : 'bg-white/5 text-gray-400 ring-1 ring-white/10 hover:bg-white/10 hover:text-gray-200',
                  ].join(' ')}
                >
                  <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Due date */}
        <section className="px-5 pt-4">
          <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <CalendarIcon size={12} /> Due date
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={task.dueDate ?? ''}
              onChange={e => setDueDate(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-200 outline-none focus:border-blue-500 [color-scheme:dark]"
            />
            {task.dueDate && (
              <button
                onClick={() => setDueDate('')}
                className="rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* Description */}
        <section className="px-5 pt-4 pb-5">
          <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <DescriptionIcon size={12} /> Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={commitDescription}
            placeholder="Add a more detailed description…"
            rows={4}
            className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm leading-relaxed text-gray-100 outline-none placeholder-gray-600 focus:border-blue-500"
          />
        </section>

        <div className="mx-5 border-t border-white/10" />

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => { onDelete(task.id, columnId); onClose(); }}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-400 ring-1 ring-rose-500/30 hover:bg-rose-500/15 transition-colors"
          >
            <TrashIcon size={13} /> Delete card
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
