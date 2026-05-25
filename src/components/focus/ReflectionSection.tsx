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
    <section className="mt-24 pt-12 border-t border-border">
      <h4 className="font-serif text-3xl italic mb-8">Evening reflection</h4>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            What shaped your attention today?
          </label>
          <textarea
            value={reflection.shaped}
            onChange={(e) => onChange({ shaped: e.target.value })}
            rows={4}
            placeholder="Thinking about…"
            className="w-full bg-surface/50 border border-border rounded-xl p-4 text-sm focus:outline-none focus:border-accent/40 resize-none placeholder:text-muted-foreground/30 transition-colors leading-relaxed"
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            What pulled it away?
          </label>
          <textarea
            value={reflection.pulled}
            onChange={(e) => onChange({ pulled: e.target.value })}
            rows={4}
            placeholder="Small distractions…"
            className="w-full bg-surface/50 border border-border rounded-xl p-4 text-sm focus:outline-none focus:border-accent/40 resize-none placeholder:text-muted-foreground/30 transition-colors leading-relaxed"
          />
        </div>
      </div>
      <p className="mt-10 text-center text-[10px] font-medium text-muted-foreground/40 uppercase tracking-[0.2em]">
        Tomorrow deserves fresh intention
      </p>
    </section>
  );
}
