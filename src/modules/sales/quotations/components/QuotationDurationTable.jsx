import { Plus, Trash2 } from "lucide-react";
import { FieldError, Input, Select } from "../../../../shared/components/forms";
import { DURATION_UNITS } from "../constants/quotationConstants";
import { emptyDuration } from "../schemas/quotation.schema";

const COLS = "grid-cols-[minmax(12rem,2.5fr)_6rem_6rem_minmax(10rem,2fr)_2rem]";

/** Completely empty rows are ignored on save; errors keys: durations.0.duration … */
export function QuotationDurationTable({ durations, onChange, errors = {} }) {
  const update = (i, patch) =>
    onChange(durations.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const remove = (i) => onChange(durations.filter((_, idx) => idx !== i));
  const err = (i, f) => errors[`durations.${i}.${f}`];

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-[640px] space-y-2">
          <div className={`grid ${COLS} gap-2 pb-1 text-xs font-medium text-ink-400`}>
            <span>Description</span>
            <span>Unit</span>
            <span>Duration</span>
            <span>Remarks</span>
            <span />
          </div>
          {durations.map((d, i) => {
            const rowErrors = ["description", "duration"]
              .map((f) => err(i, f))
              .filter(Boolean);
            const units =
              DURATION_UNITS.includes(d.unit) || !d.unit
                ? DURATION_UNITS
                : [d.unit, ...DURATION_UNITS];
            return (
              <div key={i}>
                <div className={`grid ${COLS} items-center gap-2`}>
                  <Input
                    value={d.description}
                    aria-invalid={Boolean(err(i, "description"))}
                    onChange={(e) => update(i, { description: e.target.value })}
                    placeholder="e.g. Field Works"
                  />
                  <Select
                    value={d.unit}
                    onChange={(e) => update(i, { unit: e.target.value })}
                  >
                    {units.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={d.duration}
                    aria-invalid={Boolean(err(i, "duration"))}
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
                {rowErrors.length > 0 && (
                  <FieldError>{`Row ${i + 1}: ${rowErrors.join(" · ")}`}</FieldError>
                )}
              </div>
            );
          })}
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
