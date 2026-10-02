import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { fieldBase } from "./fieldStyles";

export const Textarea = forwardRef(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(fieldBase, "resize-none", className)}
      {...props}
    />
  );
});
