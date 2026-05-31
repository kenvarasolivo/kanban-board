import { useState } from 'react';
import { Board } from './components/Board';
import { CardModal } from './components/CardModal';
import { useBoardState } from './hooks/useBoardState';
import { KanbanIcon, SearchIcon, XIcon } from './components/icons';

function App() {
  const {
    state,
    onDragEnd,
    addTask,
    updateTask,
    deleteTask,
    addColumn,
    deleteColumn,
    renameColumn,
  } = useBoardState();

  const [query, setQuery] = useState('');
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const taskCount = Object.keys(state.tasks).length;

  // Resolve the open task and the column it lives in (for the modal).
  const openTask = openTaskId ? state.tasks[openTaskId] : undefined;
  const openColumn = openTask
    ? Object.values(state.columns).find(c => c.taskIds.includes(openTask.id))
    : undefined;

  return (
    <div className="relative h-full flex flex-col bg-gray-950 overflow-hidden">
      {/* ── Animated aurora backdrop ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 -left-1/4 h-[60vh] w-[60vh] rounded-full bg-blue-600/20 blur-[120px] animate-[aurora_18s_ease-in-out_infinite]" />
        <div className="absolute top-1/4 right-0 h-[55vh] w-[55vh] rounded-full bg-violet-600/20 blur-[120px] animate-[aurora_22s_ease-in-out_infinite_reverse]" />
        <div className="absolute bottom-0 left-1/3 h-[45vh] w-[45vh] rounded-full bg-emerald-500/10 blur-[120px] animate-[aurora_26s_ease-in-out_infinite]" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 flex-shrink-0 flex items-center gap-3 px-6 py-3.5 border-b border-white/8 bg-gray-950/40 backdrop-blur-xl">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
          <KanbanIcon className="text-white" />
        </div>
        <span className="text-white font-bold text-base tracking-tight">Kanban Board</span>

        {/* Search */}
        <div className="ml-4 relative hidden sm:block">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search cards…"
            className="w-44 focus:w-64 rounded-lg border border-white/10 bg-white/5 py-1.5 pl-8 pr-7 text-sm text-gray-200 outline-none transition-all placeholder-gray-600 focus:border-blue-500/60 focus:bg-white/10"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-500 hover:text-gray-200"
              aria-label="Clear search"
            >
              <XIcon size={13} />
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <span className="text-gray-500 text-xs tabular-nums">
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </span>
          <span className="text-gray-600 text-xs">
            {state.columnOrder.length} {state.columnOrder.length === 1 ? 'list' : 'lists'}
          </span>
        </div>
      </header>

      {/* ── Board ── */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col">
        <Board
          state={state}
          query={query}
          onDragEnd={onDragEnd}
          onAddTask={addTask}
          onOpenTask={setOpenTaskId}
          onDeleteTask={deleteTask}
          onAddColumn={addColumn}
          onDeleteColumn={deleteColumn}
          onRenameColumn={renameColumn}
        />
      </div>

      {/* ── Card detail modal ── */}
      {openTask && openColumn && (
        <CardModal
          task={openTask}
          columnId={openColumn.id}
          columnTitle={openColumn.title}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onClose={() => setOpenTaskId(null)}
        />
      )}
    </div>
  );
}

export default App;
