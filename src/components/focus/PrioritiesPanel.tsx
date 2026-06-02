import { PriorityCard } from "./PriorityCard";
import { cn } from "@/lib/utils";
import type { Priority, TimeBlock } from "@/lib/storage";

interface PrioritiesPanelProps {
  priorities: Priority[];
  blocks: TimeBlock[];
  onAdd: () => void;
  onToggleComplete: (id: string) => void;
  onRemove: (id: string) => void;
}

const PLACEHOLDERS = [
  {
    primary: "The one that matters most…",
    secondary: "Click to name your first priority",
    locked: "The one that matters most…",
  },
  {
    primary: "Something that asks for real attention…",
    secondary: "Click to add your second priority",
    locked: "Add another priority once you've chosen the first.",
  },
  {
    primary: "One more thing worth your focus.",
    secondary: "Click to add a third",
    locked: "One more thing worth your focus.",
  },
];

export function PrioritiesPanel({
  priorities,
  blocks,
  onAdd,
  onToggleComplete,
  onRemove,
}: PrioritiesPanelProps) {
  const blocksFor = (id: string) => blocks.filter((b) => b.priorityId === id);
  const count = priorities.length;
  const maxSlots = 3;

  // Build the rendered rows: filled cards + empty slots
  const slots = Array.from({ length: maxSlots }, (_, i) => {
    if (i < count) return { kind: "filled" as const, priority: priorities[i], index: i };
    const isNext = i === count;
    return { kind: "empty" as const, index: i, isNext };
  });

  return (
    <section className="flex flex-col">
      <header className="mb-12">
        <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-[0.22em] mb-5">
          Intention
        </p>
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.05] mb-4 text-balance">
          What matters today?
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-md text-pretty leading-relaxed">
          Choose up to three priorities worth making space for.
        </p>
      </header>

      <ol className="space-y-3">
        {slots.map((slot) => {
          if (slot.kind === "filled") {
            return (
              <li key={slot.priority.id}>
                <PriorityCard
                  priority={slot.priority}
                  blocks={blocksFor(slot.priority.id)}
                  onToggleComplete={onToggleComplete}
                  onRemove={onRemove}
                />
              </li>
            );
          }

          const copy = PLACEHOLDERS[slot.index];
          const isPrimary = slot.index === 0;

          if (slot.isNext) {
            return (
              <li key={`empty-${slot.index}`}>
                <button
                  type="button"
                  onClick={onAdd}
                  className={cn(
                    "group relative w-full text-left rounded-2xl",
                    "pl-12 pr-6 transition-all duration-300",
                    "border border-transparent hover:border-border/40 hover:bg-surface/40",
                    isPrimary ? "py-7" : "py-6",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 font-serif italic tabular-nums",
                      "text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors",
                      isPrimary ? "text-3xl" : "text-2xl",
                    )}
                  >
                    {slot.index + 1}
                  </span>
                  <span
                    className={cn(
                      "block italic text-muted-foreground/50 group-hover:text-foreground/80 transition-colors",
                      isPrimary
                        ? "text-lg md:text-xl mb-1"
                        : "text-base mb-0.5",
                    )}
                  >
                    {copy.primary}
                  </span>
                  <span className="block text-xs text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors">
                    {copy.secondary}
                  </span>
                </button>
              </li>
            );
          }

          // Locked-but-inviting empty row (not yet unlocked)
          return (
            <li
              key={`empty-${slot.index}`}
              className={cn(
                "relative pl-12 pr-6 rounded-2xl",
                isPrimary ? "py-7" : "py-6",
              )}
              aria-disabled="true"
            >
              <span
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 font-serif italic tabular-nums text-muted-foreground/20",
                  isPrimary ? "text-3xl" : "text-2xl",
                )}
              >
                {slot.index + 1}
              </span>
              <span className="block italic text-muted-foreground/35 text-base">
                {copy.locked}
              </span>
            </li>
          );
        })}
      </ol>

      {count === maxSlots && (
        <p className="text-xs text-muted-foreground/50 text-center italic mt-6 font-serif">
          Three is enough. Make space for them.
        </p>
      )}
    </section>
  );
}
