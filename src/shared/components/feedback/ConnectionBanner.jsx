import { WifiOff } from "lucide-react";
import { API_BASE_URL } from "../../api";

export function ConnectionBanner({ connected, onRetry }) {
  if (connected) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-signal-50 px-4 py-2.5 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>
          Can't reach the API at{" "}
          <span className="font-mono text-xs">{API_BASE_URL}</span> — showing
          demo data.
        </span>
      </div>
      <button
        onClick={onRetry}
        className="font-medium underline underline-offset-2 hover:no-underline"
      >
        Retry
      </button>
    </div>
  );
}
