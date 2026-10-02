import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white/60 px-6 py-24 text-center dark:border-ink-700 dark:bg-ink-900/40">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-50 dark:bg-ink-800">
        <Compass className="h-5 w-5 text-ink-400" />
      </div>
      <h2 className="mt-4 font-display text-base font-semibold text-ink-900 dark:text-white">Page not found</h2>
      <p className="mt-1 max-w-xs text-sm text-ink-400">That route doesn't exist in Falcon Survey Engineering.</p>
      <Link to="/" className="mt-5 text-sm font-medium text-signal-600 hover:text-signal-700">
        Back to home
      </Link>
    </div>
  );
}
