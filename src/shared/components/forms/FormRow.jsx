import { cn } from "../../utils/cn";

// Default ("auto") packs fields at a comfortable minimum width (14rem) but
// never more than 4 per row: the minimum grows to a quarter of the row on
// wide screens, so extra width makes fields wider instead of adding a 5th.
// Narrow containers like modals fall back to 2.
// Numeric values force a fixed column count.
const COLS = {
  auto: "grid-cols-[repeat(auto-fill,minmax(max(14rem,calc((100%_-_3rem)/4)),1fr))]",
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function FormRow({ children, cols = "auto", className }) {
  return (
    <div className={cn("grid gap-4", COLS[cols] ?? COLS.auto, className)}>
      {children}
    </div>
  );
}
