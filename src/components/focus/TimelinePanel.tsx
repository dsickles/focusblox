import { useEffect, useMemo, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { GripHorizontal } from "lucide-react";
import type { Priority, TimeBlock } from "@/lib/storage";
import {
  DAY_END,
  DAY_START,
  PIXELS_PER_MINUTE,
  SNAP_MINUTES,
  formatHourLabel,
  formatRange,
  snap,
} from "@/lib/time";
import { cn } from "@/lib/utils";
import { useCurrentMinutes } from "@/hooks/useCurrentMinutes";

interface TimelinePanelProps {
  priorities: Priority[];
  blocks: TimeBlock[];
  isDraggingPriority: boolean;
  hoverMinutes: number | null;
  onTimelineRectRef: (el: HTMLDivElement | null) => void;
  onEditBlock: (block: TimeBlock) => void;
  onResizeBlock: (id: string, edge: "top" | "bottom", deltaMinutes: number) => void;
  onIncrementInterruption: (id: string) => void;
  onAddNonPriorityBlock: () => void;
}

const HOUR_HEIGHT = 60 * PIXELS_PER_MINUTE;

const colorForPriority = (id: string, priorities: Priority[]) => {
  const idx = priorities.findIndex((p) => p.id === id);
  // 3 subtle hues that all stay within calm range
  const hues = [130, 50, 25]; // sage, sand, terracotta
  const h = hues[idx >= 0 ? idx % hues.length : 0];
  return {
    bg: `oklch(0.74 0.05 ${h} / 0.12)`,
    border: `oklch(0.74 0.05 ${h} / 0.5)`,
    text: `oklch(0.78 0.07 ${h})`,
  };
};

export function TimelinePanel({
  priorities,
  blocks,
  isDraggingPriority,
  hoverMinutes,
  onTimelineRectRef,
  onEditBlock,
  onResizeBlock,
  onIncrementInterruption,
  onAddNonPriorityBlock,
}: TimelinePanelProps) {
  const now = useCurrentMinutes();
  const totalMinutes = DAY_END - DAY_START;
  const totalHeight = totalMinutes * PIXELS_PER_MINUTE;

  const { setNodeRef, isOver } = useDroppable({ id: "timeline" });

  const gridRef = useRef<HTMLDivElement | null>(null);
  const setRefs = (el: HTMLDivElement | null) => {
    gridRef.current = el;
    setNodeRef(el);
    onTimelineRectRef(el);
  };

  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = DAY_START / 60; h <= DAY_END / 60; h++) arr.push(h);
    return arr;
  }, []);

  const nowVisible = now !== null && now >= DAY_START && now <= DAY_END;

  return (
    <section className="flex flex-col">
      <header className="mb-12 flex items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-[0.22em] mb-5">
            Attention
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.05] mb-4 text-balance">
            When will you make time?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-md text-pretty leading-relaxed">
            Reserve focused time intentionally.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddNonPriorityBlock}
          className="hidden md:inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          + Block time
        </button>
      </header>

      {blocks.length === 0 && !isDraggingPriority && (
        <p className="mb-6 text-sm text-muted-foreground italic font-serif">
          Time is still unspoken for.
        </p>
      )}

      <div
        ref={setRefs}
        className={cn(
          "relative pl-14 transition-colors",
          isOver && "bg-accent-soft/30 rounded-xl",
        )}
        style={{ height: totalHeight }}
      >
        {/* Hour rules */}
        {hours.map((h) => {
          const offset = (h * 60 - DAY_START) * PIXELS_PER_MINUTE;
          return (
            <div
              key={h}
              className="absolute left-0 right-0 flex items-start gap-3"
              style={{ top: offset }}
            >
              <span className="w-12 -mt-2 text-[10px] font-medium text-muted-foreground/60 tabular-nums uppercase tracking-wider">
                {formatHourLabel(h)}
              </span>
              <div className="flex-1 border-t border-border/60" />
            </div>
          );
        })}

        {/* Half-hour subtle marks */}
        {hours.slice(0, -1).map((h) => {
          const offset = (h * 60 + 30 - DAY_START) * PIXELS_PER_MINUTE;
          return (
            <div
              key={`half-${h}`}
              className="absolute left-14 right-0 border-t border-dashed border-border/30"
              style={{ top: offset }}
            />
          );
        })}

        {/* Drag hover preview */}
        {isDraggingPriority && hoverMinutes !== null && (
          <div
            className="absolute left-14 right-2 rounded-xl border-2 border-dashed border-accent bg-accent/10 pointer-events-none transition-all"
            style={{
              top: (snap(hoverMinutes) - DAY_START) * PIXELS_PER_MINUTE,
              height: 60 * PIXELS_PER_MINUTE,
            }}
          />
        )}

        {/* Current time indicator */}
        {nowVisible && (
          <div
            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
            style={{ top: (now! - DAY_START) * PIXELS_PER_MINUTE }}
          >
            <div className="w-12 flex justify-end pr-2">
              <span className="text-[9px] font-medium text-accent tabular-nums">
                NOW
              </span>
            </div>
            <div className="size-2 rounded-full bg-accent ring-4 ring-background -ml-1" />
            <div className="h-px flex-1 bg-accent/40" />
          </div>
        )}

        {/* Blocks */}
        {blocks.map((b) => (
          <BlockView
            key={b.id}
            block={b}
            priority={priorities.find((p) => p.id === b.priorityId)}
            priorities={priorities}
            onEdit={() => onEditBlock(b)}
            onResize={(edge, delta) => onResizeBlock(b.id, edge, delta)}
            onInterruption={() => onIncrementInterruption(b.id)}
          />
        ))}
      </div>
    </section>
  );
}

interface BlockViewProps {
  block: TimeBlock;
  priority: Priority | undefined;
  priorities: Priority[];
  onEdit: () => void;
  onResize: (edge: "top" | "bottom", delta: number) => void;
  onInterruption: () => void;
}

function BlockView({
  block,
  priority,
  priorities,
  onEdit,
  onResize,
  onInterruption,
}: BlockViewProps) {
  const [resizing, setResizing] = useState<"top" | "bottom" | null>(null);
  const startY = useRef(0);
  const accumulated = useRef(0);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: PointerEvent) => {
      const deltaPx = e.clientY - startY.current;
      const deltaMin =
        Math.round(deltaPx / PIXELS_PER_MINUTE / SNAP_MINUTES) * SNAP_MINUTES;
      if (deltaMin !== accumulated.current) {
        onResize(resizing, deltaMin - accumulated.current);
        accumulated.current = deltaMin;
      }
    };
    const onUp = () => {
      setResizing(null);
      accumulated.current = 0;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [resizing, onResize]);

  const top = (block.start - DAY_START) * PIXELS_PER_MINUTE;
  const height = (block.end - block.start) * PIXELS_PER_MINUTE;
  const isPriority = !!priority;
  const colors = isPriority
    ? colorForPriority(priority!.id, priorities)
    : null;

  return (
    <div
      className={cn(
        "absolute left-14 right-2 rounded-xl border group/block transition-shadow",
        isPriority
          ? "border-l-2"
          : "bg-surface/60 border border-border hover:border-border-strong",
        priority?.completed && "opacity-60",
        resizing && "shadow-lg ring-2 ring-accent/30",
      )}
      style={{
        top,
        height,
        ...(colors
          ? {
              background: colors.bg,
              borderColor: colors.border,
              borderLeftColor: colors.border,
            }
          : {}),
      }}
      onClick={onEdit}
    >
      <div className="relative h-full p-3.5 cursor-pointer flex flex-col justify-between overflow-hidden">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            {isPriority && (
              <p
                className="text-[9px] font-semibold uppercase tracking-widest mb-0.5"
                style={{ color: colors!.text }}
              >
                Priority
              </p>
            )}
            <p
              className={cn(
                "font-medium truncate",
                height < 50 ? "text-xs" : "text-sm",
                priority?.completed && "line-through",
              )}
            >
              {priority?.title ?? block.label ?? "Untitled"}
            </p>
          </div>
        </div>

        {height >= 50 && (
          <div className="flex items-end justify-between gap-2">
            <span className="text-[10px] tabular-nums text-muted-foreground italic">
              {formatRange(block.start, block.end)}
            </span>
            {isPriority && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInterruption();
                }}
                className="px-2 py-1 rounded-md border text-[9px] font-medium uppercase tracking-wider transition-colors"
                style={{
                  borderColor: colors!.border,
                  color: colors!.text,
                }}
              >
                Interrupted? {block.interruptions > 0 ? block.interruptions : ""}
              </button>
            )}
          </div>
        )}

        {/* Resize handles */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            startY.current = e.clientY;
            accumulated.current = 0;
            setResizing("top");
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label="Resize top"
          className="absolute top-0 left-0 right-0 h-2 flex items-center justify-center cursor-ns-resize opacity-0 group-hover/block:opacity-100 transition-opacity"
        >
          <GripHorizontal className="size-3 text-muted-foreground" />
        </button>
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            startY.current = e.clientY;
            accumulated.current = 0;
            setResizing("bottom");
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label="Resize bottom"
          className="absolute bottom-0 left-0 right-0 h-2 flex items-center justify-center cursor-ns-resize opacity-0 group-hover/block:opacity-100 transition-opacity"
        >
          <GripHorizontal className="size-3 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
