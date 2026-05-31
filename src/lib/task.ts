import type { Priority } from '../types';

export const PRIORITY_META: Record<Priority, {
  label: string;
  /** left accent bar on the card */
  bar: string;
  /** small badge style */
  badge: string;
  /** filled dot */
  dot: string;
}> = {
  high: {
    label: 'High',
    bar: 'bg-rose-500',
    badge: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
    dot: 'bg-rose-500',
  },
  medium: {
    label: 'Medium',
    bar: 'bg-amber-400',
    badge: 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30',
    dot: 'bg-amber-400',
  },
  low: {
    label: 'Low',
    bar: 'bg-sky-400',
    badge: 'bg-sky-400/15 text-sky-300 ring-1 ring-sky-400/30',
    dot: 'bg-sky-400',
  },
};

export const PRIORITY_ORDER: Priority[] = ['low', 'medium', 'high'];

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export interface DueInfo {
  label: string;
  /** tailwind classes for the due pill */
  className: string;
  status: 'overdue' | 'today' | 'soon' | 'upcoming';
}

/** Turn an ISO date (YYYY-MM-DD) into a human label + urgency styling. */
export function describeDue(dueDate: string): DueInfo | null {
  // Parse as local date to avoid timezone drift
  const [y, m, d] = dueDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  const due = new Date(y, m - 1, d);
  due.setHours(0, 0, 0, 0);

  const today = startOfToday();
  const dayMs = 86_400_000;
  const diffDays = Math.round((due.getTime() - today.getTime()) / dayMs);

  const base = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  if (diffDays < 0) {
    return {
      label: `${base} · ${Math.abs(diffDays)}d overdue`,
      className: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
      status: 'overdue',
    };
  }
  if (diffDays === 0) {
    return {
      label: 'Due today',
      className: 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30',
      status: 'today',
    };
  }
  if (diffDays <= 2) {
    return {
      label: `Due ${base}`,
      className: 'bg-amber-400/10 text-amber-200/90 ring-1 ring-amber-400/20',
      status: 'soon',
    };
  }
  return {
    label: base,
    className: 'bg-white/5 text-gray-400 ring-1 ring-white/10',
    status: 'upcoming',
  };
}
