/** Label + value pair for read-only detail views. */
export function ReadField({ label, value, children }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-ink-400">{label}</p>
      <div className="mt-0.5 wrap-break-word text-sm font-medium text-ink-900 dark:text-ink-50">
        {children ?? (value || "—")}
      </div>
    </div>
  );
}
