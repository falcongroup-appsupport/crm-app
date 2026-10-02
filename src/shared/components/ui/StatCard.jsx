import { cn } from "../../utils/cn";

export function StatCard({ label, value, sub, icon: Icon, accent = false }) {
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-400">{label}</p>
        {Icon && (
          <div
            className={cn(
              "rounded-lg p-1.5",
              accent
                ? "bg-signal-50 text-signal-600 dark:bg-signal-500/10 dark:text-signal-400"
                : "bg-ink-50 text-ink-500 dark:bg-ink-800 dark:text-ink-400",
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tabular text-ink-950 dark:text-white">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}
