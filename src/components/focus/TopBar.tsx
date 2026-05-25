import { Moon, Sun } from "lucide-react";
import { formatLongDate } from "@/lib/time";
import { useTheme } from "@/hooks/useTheme";

export function TopBar() {
  const { theme, toggle } = useTheme();
  return (
    <nav className="flex justify-between items-center px-6 md:px-12 py-7">
      <div className="flex items-center gap-3">
        <div className="size-2.5 rounded-full bg-accent" />
        <span className="font-medium tracking-tight text-base md:text-lg">
          Focus Blocks
        </span>
      </div>
      <div className="flex items-center gap-5 md:gap-8">
        <span className="hidden sm:inline text-xs md:text-sm text-muted-foreground font-medium tabular-nums uppercase tracking-widest">
          {formatLongDate()}
        </span>
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle theme"
          className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="size-3.5" />
          ) : (
            <Moon className="size-3.5" />
          )}
        </button>
      </div>
    </nav>
  );
}
