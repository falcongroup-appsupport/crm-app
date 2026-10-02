import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

/** Accessible checkbox — the whole row (box + label) toggles it, and it works with the keyboard. */
export function Checkbox({ checked, onChange, label, className }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded text-left select-none",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors",
          checked
            ? "bg-signal-600"
            : "bg-white ring-1 ring-inset ring-ink-300 dark:bg-ink-800 dark:ring-ink-600",
        )}
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <span className="text-sm text-ink-700 dark:text-ink-300">{label}</span>
    </button>
  );
}
