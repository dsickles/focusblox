import { Plus } from "lucide-react";
import { PriorityCard } from "./PriorityCard";
import type { Priority, TimeBlock } from "@/lib/storage";

interface PrioritiesPanelProps {
  priorities: Priority[];
  blocks: TimeBlock[];
  onAdd: () => void;
  onToggleComplete: (id: string) => void;
  onRemove: (id: string) => void;
}

export function PrioritiesPanel({
  priorities,
  blocks,
  onAdd,
  onToggleComplete,
  onRemove,
}: PrioritiesPanelProps) {
  const blocksFor = (id: string) => blocks.filter((b) => b.priorityId === id);
  const canAdd = priorities.length < 3;

  return (
    <section className="flex flex-col">
      <header className="mb-10">
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.05] mb-3 text-balance">
          What matters today?
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-md text-pretty">
          Choose up to three priorities worth making space for.
        </p>
      </header>

      <div className="space-y-4">
        {priorities.length === 0 && (
          <div className="p-8 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground italic">
              Start with what actually matters today.
            </p>
          </div>
        )}

        {priorities.map((p) => (
          <PriorityCard
            key={p.id}
            priority={p}
            blocks={blocksFor(p.id)}
            onToggleComplete={onToggleComplete}
            onRemove={onRemove}
          />
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="w-full p-5 rounded-2xl border border-border flex items-center justify-center gap-2.5 text-muted-foreground hover:text-foreground hover:border-border-strong hover:bg-surface/40 transition-all group"
          >
            <Plus className="size-4 transition-transform group-hover:scale-110" strokeWidth={2} />
            <span className="font-medium text-sm">
              {priorities.length === 0
                ? "Add your first priority"
                : priorities.length === 2
                  ? "Add a third priority"
                  : "Add another priority"}
            </span>
          </button>
        )}

        {!canAdd && (
          <p className="text-xs text-muted-foreground/60 text-center italic mt-4">
            Three is enough. Make space for them.
          </p>
        )}
      </div>
    </section>
  );
}
