import { cn } from "../../utils/cn";

/** Generic colored pill — pass any Tailwind color classes via `tone`. */
export function Badge({
  children,
  tone = "bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200",
  className,
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        tone,
        className,
      )}
    >
      {children}
    </span>
  );
}
