import { useState } from "react";
import { cn } from "../../../utils/cn";

const COLS = 8;
const ROWS = 6;

/** Word-style "Insert table" grid: hover to choose the size, click to insert. */
export function TableGridPicker({ onPick }) {
  const [hover, setHover] = useState({ r: 0, c: 0 });
  return (
    <div className="w-max p-1" onMouseLeave={() => setHover({ r: 0, c: 0 })}>
      <p className="mb-1.5 px-0.5 text-xs font-medium text-ink-500">
        {hover.r ? `${hover.c} × ${hover.r} table` : "Insert table"}
      </p>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1rem)` }}
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const r = Math.floor(i / COLS) + 1;
          const c = (i % COLS) + 1;
          const on = r <= hover.r && c <= hover.c;
          return (
            <button
              key={i}
              type="button"
              aria-label={`${c} by ${r} table`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHover({ r, c })}
              onFocus={() => setHover({ r, c })}
              onClick={() => onPick(r, c)}
              className={cn(
                "h-4 w-4 rounded-[3px] ring-1 ring-inset",
                on
                  ? "bg-signal-100 ring-signal-500 dark:bg-signal-500/30"
                  : "bg-white ring-ink-300 dark:bg-ink-800 dark:ring-ink-600",
              )}
            />
          );
        })}
      </div>
      <p className="mt-1.5 px-0.5 text-[11px] text-ink-400">First row is the header</p>
    </div>
  );
}
