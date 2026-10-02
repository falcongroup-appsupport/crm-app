import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export function Loader({ label = "Loading…", className }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 py-12 text-sm text-ink-400",
        className,
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
