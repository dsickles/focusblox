import { useCallback, useEffect, useRef, useState } from "react";
import {
  emptyState,
  loadState,
  saveState,
  todayKey,
  uid,
  type FocusState,
  type Priority,
  type ReflectionState,
  type TimeBlock,
} from "@/lib/storage";
import { overlaps, snap } from "@/lib/time";

export const useFocusStore = () => {
  const [state, setState] = useState<FocusState>(() => emptyState());
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  // Midnight reset check (every 30s)
  const lastDate = useRef(state.date);
  useEffect(() => {
    lastDate.current = state.date;
  }, [state.date]);

  useEffect(() => {
    const i = setInterval(() => {
      const today = todayKey();
      if (today !== lastDate.current) {
        setState(emptyState());
      }
    }, 30_000);
    return () => clearInterval(i);
  }, []);

  const addPriority = useCallback(
    (input: {
      title: string;
      description?: string;
      estimatedMinutes?: number;
      block?: { start: number; end: number };
    }) => {
      setState((s) => {
        if (s.priorities.length >= 3) return s;
        const p: Priority = {
          id: uid(),
          title: input.title.trim(),
          description: input.description?.trim() || undefined,
          estimatedMinutes: input.estimatedMinutes,
          completed: false,
          createdAt: Date.now(),
        };
        const next: FocusState = { ...s, priorities: [...s.priorities, p] };
        if (input.block) {
          const start = snap(input.block.start);
          const end = snap(input.block.end);
          if (end > start && !next.blocks.some((b) => overlaps(b, { start, end }))) {
            next.blocks = [
              ...next.blocks,
              {
                id: uid(),
                start,
                end,
                priorityId: p.id,
                interruptions: 0,
              },
            ];
          }
        }
        return next;
      });
    },
    [],
  );

  const updatePriority = useCallback(
    (id: string, patch: Partial<Priority>) =>
      setState((s) => ({
        ...s,
        priorities: s.priorities.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      })),
    [],
  );

  const togglePriorityComplete = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        priorities: s.priorities.map((p) =>
          p.id === id ? { ...p, completed: !p.completed } : p,
        ),
      })),
    [],
  );

  const removePriority = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        priorities: s.priorities.filter((p) => p.id !== id),
        blocks: s.blocks.filter((b) => b.priorityId !== id),
      })),
    [],
  );

  /** returns the new block id if successful */
  const addBlock = useCallback(
    (input: Omit<TimeBlock, "id" | "interruptions"> & { id?: string }) => {
      let createdId: string | null = null;
      setState((s) => {
        const start = snap(input.start);
        const end = snap(input.end);
        if (end <= start) return s;
        const conflict = s.blocks.some((b) =>
          overlaps(b, { start, end }) && b.id !== input.id,
        );
        if (conflict) return s;
        const block: TimeBlock = {
          id: input.id ?? uid(),
          start,
          end,
          priorityId: input.priorityId,
          label: input.label,
          notes: input.notes,
          interruptions: 0,
        };
        createdId = block.id;
        return { ...s, blocks: [...s.blocks, block] };
      });
      return createdId;
    },
    [],
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<TimeBlock>) =>
      setState((s) => {
        const current = s.blocks.find((b) => b.id === id);
        if (!current) return s;
        const next = { ...current, ...patch };
        next.start = snap(next.start);
        next.end = snap(next.end);
        if (next.end <= next.start) return s;
        const conflict = s.blocks.some(
          (b) => b.id !== id && overlaps(b, next),
        );
        if (conflict) return s;
        return {
          ...s,
          blocks: s.blocks.map((b) => (b.id === id ? next : b)),
        };
      }),
    [],
  );

  const removeBlock = useCallback(
    (id: string) =>
      setState((s) => ({ ...s, blocks: s.blocks.filter((b) => b.id !== id) })),
    [],
  );

  const incrementInterruption = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        blocks: s.blocks.map((b) =>
          b.id === id ? { ...b, interruptions: b.interruptions + 1 } : b,
        ),
      })),
    [],
  );

  const setReflection = useCallback(
    (patch: Partial<ReflectionState>) =>
      setState((s) => ({ ...s, reflection: { ...s.reflection, ...patch } })),
    [],
  );

  return {
    state,
    hydrated,
    addPriority,
    updatePriority,
    togglePriorityComplete,
    removePriority,
    addBlock,
    updateBlock,
    removeBlock,
    incrementInterruption,
    setReflection,
  };
};
