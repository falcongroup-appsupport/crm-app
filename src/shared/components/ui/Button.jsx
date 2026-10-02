import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const variants = {
  primary: "bg-signal-600 text-white hover:bg-signal-700 active:bg-signal-800",
  secondary:
    "bg-white text-ink-900 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 dark:bg-ink-800 dark:text-ink-50 dark:ring-ink-700 dark:hover:bg-ink-700",
  ghost:
    "text-ink-500 hover:text-ink-900 hover:bg-ink-50 dark:text-ink-400 dark:hover:text-white dark:hover:bg-ink-800",
  danger:
    "bg-white text-signal-600 ring-1 ring-inset ring-signal-200 hover:bg-signal-50 dark:bg-ink-800 dark:text-signal-400 dark:ring-signal-900 dark:hover:bg-signal-950/40",
};

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  icon: "h-9 w-9",
};

export const Button = forwardRef(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});
