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
  const isEmpty = priorities.length === 0;

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

      <div className="space-y-5">
        {isEmpty && (
          <div className="relative">
            {/* Three faint placeholder lines — visual rhythm without clutter */}
            <ol className="space-y-3">
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="relative pl-10 py-5 border-b border-border/40 last:border-b-0"
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 font-serif italic text-2xl text-muted-foreground/25 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="block text-sm text-muted-foreground/40 italic">
                    {i === 0
                      ? "The one that matters most…"
                      : i === 1
                        ? "Something that asks for real attention…"
                        : "One more thing worth your focus."}
                  </span>
                </li>
              ))}
            </ol>
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
            className="group w-full flex items-center gap-4 pt-6 text-left"
          >
            <span className="h-px flex-1 bg-border/60 group-hover:bg-border-strong transition-colors" />
            <span className="font-serif italic text-base text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
              {isEmpty
                ? "Name your first priority"
                : priorities.length === 2
                  ? "Add a third"
                  : "Add another"}
            </span>
            <span className="h-px flex-1 bg-border/60 group-hover:bg-border-strong transition-colors" />
          </button>
        )}

        {!canAdd && (
          <p className="text-xs text-muted-foreground/50 text-center italic mt-6 font-serif">
            Three is enough. Make space for them.
          </p>
        )}
      </div>
    </section>
  );
}
