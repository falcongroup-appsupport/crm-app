import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { fieldBase } from "./fieldStyles";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(fieldBase, className)} {...props} />;
});
