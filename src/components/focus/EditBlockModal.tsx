import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Priority, TimeBlock } from "@/lib/storage";
import { snap } from "@/lib/time";

interface EditBlockModalProps {
  block: TimeBlock | null;
  priorities: Priority[];
  onClose: () => void;
  onSave: (id: string, patch: Partial<TimeBlock>) => void;
  onDelete: (id: string) => void;
}

const minutesToInput = (m: number) => {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
};

const inputToMinutes = (v: string) => {
  const [h, m] = v.split(":").map(Number);
  return h * 60 + m;
};

export function EditBlockModal({
  block,
  priorities,
  onClose,
  onSave,
  onDelete,
}: EditBlockModalProps) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [priorityId, setPriorityId] = useState<string>("");
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!block) return;
    setStart(minutesToInput(block.start));
    setEnd(minutesToInput(block.end));
    setPriorityId(block.priorityId ?? "");
    setLabel(block.label ?? "");
    setNotes(block.notes ?? "");
  }, [block]);

  useEffect(() => {
    if (!block) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [block, onClose]);

  if (!block) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const s = snap(inputToMinutes(start));
    const en = snap(inputToMinutes(end));
    if (en <= s) return;
    onSave(block.id, {
      start: s,
      end: en,
      priorityId: priorityId || null,
      label: priorityId ? undefined : label.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <form
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface-elevated rounded-2xl border border-border shadow-2xl p-7 animate-in zoom-in-95 duration-200"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-serif text-2xl mb-0.5">
              {block.id ? "Edit block" : "Block time"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {block.id ? "Adjust reserved time." : "Reserve a stretch of the day."}
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
              Linked priority
            </label>
            <select
              value={priorityId}
              onChange={(e) => setPriorityId(e.target.value)}
              className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-2 text-sm transition-colors"
            >
              <option value="">— Not linked (e.g. lunch, walk)</option>
              {priorities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {!priorityId && (
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
                Label
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Lunch, walk, errand…"
                className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-2 text-sm placeholder:text-muted-foreground/40 transition-colors"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
              Notes <span className="opacity-50">— optional</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="A quiet intention…"
              className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-2 text-sm resize-none placeholder:text-muted-foreground/40 transition-colors"
            />
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onDelete(block.id);
              onClose();
            }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Release this block
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
