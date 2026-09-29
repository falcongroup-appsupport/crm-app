import { cn } from "../../utils/cn";

export function FormRow({ children, cols = 2 }) {
  return <div className={cn("grid gap-4", cols === 2 ? "grid-cols-2" : "grid-cols-1")}>{children}</div>;
}
