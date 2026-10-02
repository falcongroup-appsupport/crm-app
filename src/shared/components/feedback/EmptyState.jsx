import { Inbox } from "lucide-react";
import { Button } from "../ui/Button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white/60 px-6 py-16 text-center dark:border-ink-700 dark:bg-ink-900/40">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-50 dark:bg-ink-800">
        <Icon className="h-5 w-5 text-ink-400" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-ink-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-ink-400">{description}</p>
      {actionLabel && (
        <Button size="sm" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
