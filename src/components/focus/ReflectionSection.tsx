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
    <section className="relative mt-20 pt-16 bg-evening-fade rounded-t-[2rem] -mx-6 md:-mx-12 px-6 md:px-12 pb-4">
      <header className="mb-10 max-w-md">
        <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-[0.22em] mb-4">
          Evening
        </p>
        <h4 className="font-serif text-3xl md:text-4xl italic leading-tight">
          A moment to look back.
        </h4>
      </header>
      <div className="grid md:grid-cols-2 gap-10 md:gap-14 max-w-4xl">
        <div className="space-y-3">
          <label className="block font-serif italic text-base text-muted-foreground/90">
            What shaped your attention today?
          </label>
          <textarea
            value={reflection.shaped}
            onChange={(e) => onChange({ shaped: e.target.value })}
            rows={4}
            placeholder="Thinking about…"
            className="w-full bg-transparent border-0 border-b border-border/50 px-0 py-3 text-base leading-relaxed focus:outline-none focus:border-accent/40 resize-none placeholder:text-muted-foreground/30 placeholder:italic transition-colors"
          />
        </div>
        <div className="space-y-3">
          <label className="block font-serif italic text-base text-muted-foreground/90">
            What pulled it away?
          </label>
          <textarea
            value={reflection.pulled}
            onChange={(e) => onChange({ pulled: e.target.value })}
            rows={4}
            placeholder="Small distractions…"
            className="w-full bg-transparent border-0 border-b border-border/50 px-0 py-3 text-base leading-relaxed focus:outline-none focus:border-accent/40 resize-none placeholder:text-muted-foreground/30 placeholder:italic transition-colors"
          />
        </div>
      </div>
      <p className="mt-16 text-center text-[10px] font-medium text-muted-foreground/40 uppercase tracking-[0.22em]">
        Tomorrow deserves fresh intention
      </p>
    </section>
  );
}
