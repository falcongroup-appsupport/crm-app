import { Plus, Trash2 } from "lucide-react";
import { Input, Select } from "../../../../shared/components/forms";
import { DURATION_UNITS } from "../constants/quotationConstants";
import { emptyDuration } from "../schemas/quotation.schema";

const COLS = "grid-cols-[minmax(12rem,2.5fr)_6rem_6rem_minmax(10rem,2fr)_2rem]";

export function QuotationDurationTable({ durations, onChange }) {
  const update = (i, patch) =>
    onChange(durations.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const remove = (i) => onChange(durations.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-160 space-y-2">
          <div
            className={`grid ${COLS} gap-2 pb-1 text-xs font-medium text-ink-400`}
          >
            <span>Description</span>
            <span>Unit</span>
            <span>Duration</span>
            <span>Remarks</span>
            <span />
          </div>
          {durations.map((d, i) => (
            <div key={i} className={`grid ${COLS} items-center gap-2`}>
              <Input
                value={d.description}
                onChange={(e) => update(i, { description: e.target.value })}
                placeholder="e.g. Field Works"
              />
              <Select
                value={d.unit}
                onChange={(e) => update(i, { unit: e.target.value })}
              >
                {DURATION_UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </Select>
              <Input
                type="number"
                min="0"
                step="any"
                value={d.duration}
                onChange={(e) => update(i, { duration: e.target.value })}
              />
              <Input
                value={d.remarks}
                onChange={(e) => update(i, { remarks: e.target.value })}
                placeholder="Optional"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded-md p-1.5 text-ink-400 hover:bg-signal-50 hover:text-signal-600 dark:hover:bg-signal-500/10"
                aria-label="Remove duration row"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange([...durations, emptyDuration()])}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-signal-600 hover:text-signal-700"
      >
        <Plus className="h-3.5 w-3.5" />
        Add duration row
      </button>
    </div>
  );
}
