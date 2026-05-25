export type PriorityId = string;

export interface Priority {
  id: PriorityId;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  completed: boolean;
  createdAt: number;
}

export interface TimeBlock {
  id: string;
  /** minutes from midnight */
  start: number;
  /** minutes from midnight */
  end: number;
  /** linked priority, or null for non-priority blocks (e.g. lunch) */
  priorityId: PriorityId | null;
  label?: string; // for non-priority blocks
  interruptions: number;
  notes?: string;
}

export interface ReflectionState {
  shaped: string;
  pulled: string;
}

export interface FocusState {
  date: string; // YYYY-MM-DD local
  priorities: Priority[];
  blocks: TimeBlock[];
  reflection: ReflectionState;
}

export const todayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const STORAGE_KEY = "focus-blocks:v1";

export const emptyState = (): FocusState => ({
  date: todayKey(),
  priorities: [],
  blocks: [],
  reflection: { shaped: "", pulled: "" },
});

export const loadState = (): FocusState => {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as FocusState;
    if (parsed.date !== todayKey()) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
};

export const saveState = (state: FocusState) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
};

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
