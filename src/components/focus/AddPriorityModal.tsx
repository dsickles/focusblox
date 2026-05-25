import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { snap } from "@/lib/time";

export interface NewPriorityInput {
  title: string;
  description?: string;
  estimatedMinutes?: number;
  block?: { start: number; end: number };
}

interface AddPriorityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewPriorityInput) => void;
}

const toMinutes = (v: string) => {
  if (!v) return null;
  const [h, m] = v.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

export function AddPriorityModal({
  open,
  onClose,
  onSubmit,
}: AddPriorityModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimate, setEstimate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setEstimate("");
      setStart("");
      setEnd("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    const block =
      startMin !== null && endMin !== null && endMin > startMin
        ? { start: snap(startMin), end: snap(endMin) }
        : undefined;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedMinutes: estimate ? Number(estimate) : undefined,
      block,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-surface-elevated rounded-2xl border border-border shadow-2xl p-8 animate-in zoom-in-95 duration-200"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-serif text-3xl mb-1">A new priority</h2>
            <p className="text-sm text-muted-foreground">
              Make space for something that matters.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
              Title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What deserves your attention?"
              className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-2 text-base font-medium placeholder:text-muted-foreground/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
              Description <span className="opacity-50">— optional</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="A sentence to ground it."
              className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-2 text-sm resize-none placeholder:text-muted-foreground/40 transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
                Estimate
              </label>
              <div className="flex items-baseline gap-1.5">
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={estimate}
                  onChange={(e) => setEstimate(e.target.value)}
                  placeholder="60"
                  className="w-16 bg-transparent border-b border-border focus:border-accent outline-none py-2 text-sm tabular-nums placeholder:text-muted-foreground/40 transition-colors"
                />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
                Start
              </label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-2 text-sm tabular-nums transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
                End
              </label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-2 text-sm tabular-nums transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-5 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Reserve a place
          </button>
        </div>
      </form>
    </div>
  );
}
