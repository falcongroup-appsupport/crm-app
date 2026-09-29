import { cn } from "../../utils/cn";

export function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between gap-4">
      {label && <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-emerald-500" : "bg-ink-200 dark:bg-ink-700",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
