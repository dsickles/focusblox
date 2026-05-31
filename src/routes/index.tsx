import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { TopBar } from "@/components/focus/TopBar";
import { PrioritiesPanel } from "@/components/focus/PrioritiesPanel";
import { TimelinePanel } from "@/components/focus/TimelinePanel";
import { ReflectionSection } from "@/components/focus/ReflectionSection";
import {
  AddPriorityModal,
  type NewPriorityInput,
} from "@/components/focus/AddPriorityModal";
import { EditBlockModal } from "@/components/focus/EditBlockModal";
import { useFocusStore } from "@/hooks/useFocusStore";
import { DAY_END, DAY_START, PIXELS_PER_MINUTE, snap } from "@/lib/time";
import type { TimeBlock } from "@/lib/storage";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const {
    state,
    addPriority,
    togglePriorityComplete,
    removePriority,
    addBlock,
    updateBlock,
    removeBlock,
    incrementInterruption,
    setReflection,
  } = useFocusStore();

  const [addOpen, setAddOpen] = useState(false);
  const [editBlock, setEditBlock] = useState<TimeBlock | null>(null);
  const [activePriorityId, setActivePriorityId] = useState<string | null>(null);
  const [hoverMinutes, setHoverMinutes] = useState<number | null>(null);

  const timelineRef = useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const computeMinutesFromClientY = (clientY: number): number | null => {
    const el = timelineRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const y = clientY - rect.top;
    const minutes = DAY_START + y / PIXELS_PER_MINUTE;
    if (minutes < DAY_START - 30 || minutes > DAY_END) return null;
    return Math.max(DAY_START, Math.min(DAY_END - 60, minutes));
  };

  const handleDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as { type?: string; priorityId?: string } | undefined;
    if (data?.type === "priority" && data.priorityId) {
      setActivePriorityId(data.priorityId);
    }
  };

  const handleDragMove = (e: DragMoveEvent) => {
    if (!activePriorityId) return;
    const rect = e.active.rect.current.translated;
    if (!rect) return;
    const m = computeMinutesFromClientY(rect.top);
    setHoverMinutes(m);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const pid = activePriorityId;
    setActivePriorityId(null);
    const minutes = hoverMinutes;
    setHoverMinutes(null);
    if (!pid || e.over?.id !== "timeline" || minutes === null) return;
    const start = snap(minutes);
    addBlock({
      start,
      end: start + 60,
      priorityId: pid,

    });
  };

  const handleResizeBlock = (
    id: string,
    edge: "top" | "bottom",
    delta: number,
  ) => {
    const b = state.blocks.find((x) => x.id === id);
    if (!b) return;
    if (edge === "top") {
      const next = Math.max(DAY_START, Math.min(b.end - 15, b.start + delta));
      updateBlock(id, { start: next });
    } else {
      const next = Math.min(DAY_END, Math.max(b.start + 15, b.end + delta));
      updateBlock(id, { end: next });
    }
  };

  const handleAddPriority = (input: NewPriorityInput) => addPriority(input);

  const handleAddNonPriorityBlock = () => {
    // Find the next free slot to seed the modal — user can edit before saving.
    const sorted = [...state.blocks].sort((a, b) => a.start - b.start);
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const cursorStart = snap(Math.max(DAY_START, nowMin));

    const findSlot = (from: number): { start: number; end: number } | null => {
      let cursor = Math.max(from, DAY_START);
      for (const b of sorted) {
        if (b.end <= cursor) continue;
        if (b.start >= cursor + 30) {
          const end = Math.min(b.start, cursor + 60);
          if (end - cursor >= 30) return { start: cursor, end };
        }
        cursor = Math.max(cursor, b.end);
      }
      if (cursor + 30 <= DAY_END) {
        return { start: cursor, end: Math.min(DAY_END, cursor + 60) };
      }
      return null;
    };

    const slot = findSlot(cursorStart) ?? findSlot(DAY_START) ?? {
      start: DAY_START,
      end: DAY_START + 60,
    };

    // Draft block — id "" signals "not yet persisted" to the modal/save handler.
    setEditBlock({
      id: "",
      start: slot.start,
      end: slot.end,
      priorityId: null,
      label: "",
      interruptions: 0,
    });
  };

  const handleSaveBlock = (id: string, patch: Partial<TimeBlock>) => {
    if (id) {
      updateBlock(id, patch);
      return;
    }
    addBlock({
      start: patch.start ?? DAY_START,
      end: patch.end ?? DAY_START + 60,
      priorityId: patch.priorityId ?? null,
      label: patch.label,
      notes: patch.notes,
    });
  };


  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActivePriorityId(null);
        setHoverMinutes(null);
      }}
    >
      <div className="min-h-screen bg-background text-foreground">
        <TopBar />

        <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-8 md:pt-12">
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col">
              <PrioritiesPanel
                priorities={state.priorities}
                blocks={state.blocks}
                onAdd={() => setAddOpen(true)}
                onToggleComplete={togglePriorityComplete}
                onRemove={removePriority}
              />
              <ReflectionSection
                reflection={state.reflection}
                onChange={setReflection}
              />
            </div>
            <div className="lg:col-span-6 xl:col-span-7 lg:border-l lg:border-border/40 lg:pl-12 xl:pl-16">
              <TimelinePanel
                priorities={state.priorities}
                blocks={state.blocks}
                isDraggingPriority={!!activePriorityId}
                hoverMinutes={hoverMinutes}
                onTimelineRectRef={(el) => (timelineRef.current = el)}
                onEditBlock={(b) => setEditBlock(b)}
                onResizeBlock={handleResizeBlock}
                onIncrementInterruption={incrementInterruption}
                onAddNonPriorityBlock={handleAddNonPriorityBlock}
              />
            </div>
          </div>
        </main>

        <AddPriorityModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSubmit={handleAddPriority}
        />
        <EditBlockModal
          block={editBlock}
          priorities={state.priorities}
          onClose={() => setEditBlock(null)}
          onSave={handleSaveBlock}
          onDelete={removeBlock}
        />

      </div>
    </DndContext>
  );
}
