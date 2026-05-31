import { Board } from './components/Board';
import { useBoardState } from './hooks/useBoardState';

function App() {
  const {
    state,
    onDragEnd,
    addTask,
    editTask,
    deleteTask,
    addColumn,
    deleteColumn,
    renameColumn,
  } = useBoardState();

  const taskCount = Object.keys(state.tasks).length;

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* ── Header ── */}
      <header className="flex-shrink-0 flex items-center gap-3 px-6 py-3.5 border-b border-gray-800/80">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
          <KanbanIcon />
        </div>
        <span className="text-white font-bold text-base tracking-tight">Kanban Board</span>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-gray-600 text-xs tabular-nums">
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </span>
          <span className="text-gray-700 text-xs">
            {state.columnOrder.length} {state.columnOrder.length === 1 ? 'list' : 'lists'}
          </span>
        </div>
      </header>

      {/* ── Board ── */}
      <Board
        state={state}
        onDragEnd={onDragEnd}
        onAddTask={addTask}
        onEditTask={editTask}
        onDeleteTask={deleteTask}
        onAddColumn={addColumn}
        onDeleteColumn={deleteColumn}
        onRenameColumn={renameColumn}
      />
    </div>
  );
}

function KanbanIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="13" rx="1" />
      <rect x="14" y="3" width="7" height="8" rx="1" />
      <rect x="14" y="15" width="7" height="6" rx="1" />
    </svg>
  );
}

export default App;
