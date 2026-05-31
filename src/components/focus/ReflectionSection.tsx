import type { ReflectionState } from "@/lib/storage";

interface ReflectionSectionProps {
  reflection: ReflectionState;
  onChange: (patch: Partial<ReflectionState>) => void;
}

export function ReflectionSection({
  reflection,
  onChange,
}: ReflectionSectionProps) {
  return (
    <section className="mt-16 pt-10 border-t border-border/30">
      <header className="mb-8">
        <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-[0.22em] mb-3">
          Evening
        </p>
        <h4 className="font-serif text-2xl md:text-3xl italic leading-tight">
          A moment to look back.
        </h4>
      </header>
      <div className="grid md:grid-cols-2 gap-8 md:gap-10">
        <div className="space-y-2">
          <label className="block font-serif italic text-sm text-muted-foreground/90">
            What shaped your attention today?
          </label>
          <textarea
            value={reflection.shaped}
            onChange={(e) => onChange({ shaped: e.target.value })}
            rows={3}
            placeholder="Thinking about…"
            className="w-full bg-transparent border-0 border-b border-border/50 px-0 py-2.5 text-base leading-relaxed focus:outline-none focus:border-accent/40 resize-none placeholder:text-muted-foreground/30 placeholder:italic transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-serif italic text-sm text-muted-foreground/90">
            What pulled it away?
          </label>
          <textarea
            value={reflection.pulled}
            onChange={(e) => onChange({ pulled: e.target.value })}
            rows={3}
            placeholder="Small distractions…"
            className="w-full bg-transparent border-0 border-b border-border/50 px-0 py-2.5 text-base leading-relaxed focus:outline-none focus:border-accent/40 resize-none placeholder:text-muted-foreground/30 placeholder:italic transition-colors"
          />
        </div>
      </div>
      <p className="mt-10 text-center text-[10px] font-medium text-muted-foreground/40 uppercase tracking-[0.22em]">
        Tomorrow deserves fresh intention
      </p>
    </section>
  );
}
