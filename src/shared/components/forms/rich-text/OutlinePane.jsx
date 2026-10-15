import { cn } from "../../../utils/cn";

/** Word's "Navigation pane": section and sub-headings — click to jump. */
export function OutlinePane({ headings, onJump, className }) {
  return (
    <nav
      aria-label="Document outline"
      className={cn(
        "w-56 shrink-0 overflow-y-auto border-r border-ink-200 bg-white/70 px-2 py-3 dark:border-ink-800 dark:bg-ink-900/60",
        className,
      )}
    >
      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        Navigation
      </p>
      {headings.length === 0 ? (
        <p className="px-2 text-xs leading-relaxed text-ink-400">
          Add a section heading (Home → Styles) and it appears here.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {headings.map((h) => (
            <li key={h.pos}>
              <button
                type="button"
                onClick={() => onJump(h.pos)}
                className={cn(
                  "w-full truncate rounded-md px-2 py-1 text-left text-xs hover:bg-ink-100 dark:hover:bg-ink-800",
                  h.level === 3
                    ? "font-semibold text-ink-800 dark:text-ink-100"
                    : "pl-5 text-ink-500 dark:text-ink-400",
                )}
                title={h.text}
              >
                {h.text || "(empty heading)"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
