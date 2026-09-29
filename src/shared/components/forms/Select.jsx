import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";
import { fieldBase } from "./fieldStyles";

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(fieldBase, "appearance-none pr-9 cursor-pointer", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
    </div>
  );
});
