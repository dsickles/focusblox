import { useDraggable } from "@dnd-kit/core";
import { Check, X } from "lucide-react";
import type { Priority, TimeBlock } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { formatRange } from "@/lib/time";

interface PriorityCardProps {
  priority: Priority;
  blocks: TimeBlock[];
  onToggleComplete: (id: string) => void;
  onRemove: (id: string) => void;
}

export function PriorityCard({
  priority,
  blocks,
  onToggleComplete,
  onRemove,
}: PriorityCardProps) {
  const scheduled = blocks.length > 0;
  const totalMinutes = blocks.reduce((sum, b) => sum + (b.end - b.start), 0);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `priority:${priority.id}`,
    data: { type: "priority", priorityId: priority.id },
    disabled: priority.completed,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative p-6 rounded-2xl transition-all duration-300",
        "touch-none select-none",
        priority.completed &&
          "bg-surface/40 border border-border opacity-50 cursor-default",
        !priority.completed &&
          scheduled &&
          "bg-surface border border-accent/25 ring-1 ring-accent/10 cursor-grab active:cursor-grabbing",
        !priority.completed &&
          !scheduled &&
          "border border-dashed border-border hover:border-border-strong cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex justify-between items-start mb-3">
        {priority.completed ? (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Done for today
          </span>
        ) : scheduled ? (
          <div className="px-2 py-0.5 rounded bg-accent-soft border border-accent/20">
            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
              Scheduled
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Needs time reserved
          </span>
        )}

        <div className="flex items-center gap-1 -my-1 -mr-1">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(priority.id);
            }}
            aria-label={priority.completed ? "Mark incomplete" : "Mark complete"}
            className={cn(
              "size-6 rounded-md border flex items-center justify-center transition-colors",
              priority.completed
                ? "bg-accent/20 border-accent/40 text-accent"
                : "border-border hover:border-accent hover:text-accent text-transparent",
            )}
          >
            <Check className="size-3.5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(priority.id);
            }}
            aria-label="Remove priority"
            className="size-6 rounded-md flex items-center justify-center text-muted-foreground/60 opacity-0 group-hover:opacity-100 hover:text-foreground transition-all"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <h3
        className={cn(
          "text-lg font-medium leading-snug mb-1.5",
          priority.completed && "line-through decoration-muted-foreground/40",
        )}
      >
        {priority.title}
      </h3>

      {priority.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {priority.description}
        </p>
      )}

      {(scheduled || priority.estimatedMinutes) && !priority.completed && (
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground tabular-nums">
          {scheduled ? (
            <>
              <span>{totalMinutes} min reserved</span>
              {blocks[0] && (
                <>
                  <span className="text-border">/</span>
                  <span>{formatRange(blocks[0].start, blocks[0].end)}</span>
                </>
              )}
              {blocks.length > 1 && (
                <>
                  <span className="text-border">/</span>
                  <span>+{blocks.length - 1} more</span>
                </>
              )}
            </>
          ) : (
            <span>~{priority.estimatedMinutes} min estimated</span>
          )}
        </div>
      )}
    </div>
  );
}
