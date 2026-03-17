export const TASK_TAGS = ['Urgent', 'Internal', 'Finance', 'Backend'] as const;

const TAG_COLOR_MAP: Record<string, { selected: string; unselected: string; badge: string }> = {
  Urgent: {
    selected: 'bg-red-600 border-red-600 text-white shadow-sm scale-105 transition-all',
    unselected: 'border-red-100 bg-red-50/60 text-red-500 hover:border-red-200',
    badge: 'border-red-200 bg-red-50 text-red-700',
  },
  Internal: {
    selected: 'bg-blue-600 border-indigo-600 text-white shadow-sm scale-105 transition-all',
    unselected: 'border-indigo-100 bg-indigo-50/60 text-indigo-500 hover:border-indigo-200',
    badge: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  Finance: {
    selected: 'bg-green-600 border-emerald-600 text-white shadow-sm scale-105 transition-all',
    unselected: 'border-emerald-100 bg-emerald-50/60 text-emerald-600 hover:border-emerald-200',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  Backend: {
    selected: 'bg-black border-violet-600 text-white shadow-sm scale-105 transition-all',
    unselected: 'border-violet-100 bg-violet-50/60 text-violet-600 hover:border-violet-200',
    badge: 'border-violet-200 bg-violet-50 text-violet-700',
  },
};

export function getTagClasses(tag: string, mode: 'selected' | 'unselected' | 'badge') {
  const fallback = {
    selected: 'border-slate-200 bg-slate-50 text-slate-700',
    unselected: 'border-slate-200 bg-slate-100 text-slate-500',
    badge: 'border-slate-200 bg-slate-50 text-slate-700',
  };
  return TAG_COLOR_MAP[tag]?.[mode] ?? fallback[mode];
}

