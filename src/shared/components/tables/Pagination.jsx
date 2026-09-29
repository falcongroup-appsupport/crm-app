import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const window = 2;
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= window) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50 disabled:opacity-30 dark:text-ink-400 dark:hover:bg-ink-800"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1.5 text-sm text-ink-300">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium",
              p === page ? "bg-ink-950 text-white dark:bg-white dark:text-ink-950" : "text-ink-500 hover:bg-ink-50 dark:text-ink-400 dark:hover:bg-ink-800",
            )}
          >
            {p + 1}
          </button>
        ),
      )}
      <button
        disabled={page === totalPages - 1}
        onClick={() => onChange(page + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50 disabled:opacity-30 dark:text-ink-400 dark:hover:bg-ink-800"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
