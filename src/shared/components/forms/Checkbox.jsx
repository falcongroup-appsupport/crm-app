import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

export function Checkbox({ checked, onChange, label, className }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2.5 select-none", className)}>
      <span
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors",
          checked ? "bg-signal-600" : "bg-white ring-1 ring-inset ring-ink-300 dark:bg-ink-800 dark:ring-ink-600",
        )}
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <span className="text-sm text-ink-700 dark:text-ink-300">{label}</span>
    </label>
  );
}
