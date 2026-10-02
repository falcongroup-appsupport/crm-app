import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";

export function EnquiryToolbar({
  query,
  onQueryChange,
  onNew,
  onToggleFilters,
  filtersOpen,
  activeFilterCount,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by enquiry number, company, contact person or project…"
          className="h-9 w-full rounded-lg bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 ring-1 ring-inset ring-ink-100 focus:ring-2 focus:ring-signal-500 dark:bg-ink-800 dark:text-ink-50 dark:ring-ink-700 dark:placeholder:text-ink-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={filtersOpen ? "primary" : "secondary"}
          size="md"
          onClick={onToggleFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter by task
          {activeFilterCount > 0 && (
            <span className="ml-0.5 rounded-full bg-white/20 px-1.5 text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
        <Button size="md" onClick={onNew}>
          <Plus className="h-4 w-4" />
          Add enquiry
        </Button>
      </div>
    </div>
  );
}
