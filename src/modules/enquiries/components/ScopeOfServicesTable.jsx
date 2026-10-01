import { Plus, Trash2 } from "lucide-react";
import { Select, Input, FieldError } from "../../../shared/components/forms";
import { SCOPE_UNITS } from "../constants/enquiryStatus";
import { emptyScope } from "../schemas/enquiry.schema";

const COLS = "grid-cols-[2fr_1fr_1fr_2fr_auto]";

/** errors: the form's error map; prefix: e.g. "projects.0.scope" */
export function ScopeOfServicesTable({ scopes, activities, onChange, errors = {}, prefix }) {
  const update = (index, patch) => onChange(scopes.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const removeRow = (index) => onChange(scopes.filter((_, i) => i !== index));
  const err = (j, field) => errors[`${prefix}.${j}.${field}`];

  return (
    <div>
      <div className={`grid ${COLS} gap-2 pb-1.5 text-xs font-medium text-ink-400`}>
        <span>Activity name *</span>
        <span>Unit *</span>
        <span>Quantity *</span>
        <span>Remarks</span>
        <span />
      </div>
      <div className="space-y-2">
        {scopes.map((scope, i) => {
          const rowErrors = ["activityId", "unit", "quantity", "remarks"].map((f) => err(i, f)).filter(Boolean);
          // keep a stored unit selectable even if it isn't in the standard list
          const units = SCOPE_UNITS.includes(scope.unit) || !scope.unit ? SCOPE_UNITS : [scope.unit, ...SCOPE_UNITS];
          return (
            <div key={i}>
              <div className={`grid ${COLS} items-center gap-2`}>
                <Select
                  value={scope.activityId}
                  aria-invalid={Boolean(err(i, "activityId"))}
                  onChange={(e) => {
                    const activity = activities.find((a) => String(a.activityId ?? a.id) === e.target.value);
                    update(i, { activityId: e.target.value, activityName: activity?.activityName });
                  }}
                >
                  <option value="">Select activity…</option>
                  {activities.map((a) => (
                    <option key={a.activityId ?? a.id} value={a.activityId ?? a.id}>
                      {a.activityName}
                    </option>
                  ))}
                </Select>
                <Select value={scope.unit} aria-invalid={Boolean(err(i, "unit"))} onChange={(e) => update(i, { unit: e.target.value })}>
                  {units.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </Select>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={scope.quantity}
                  aria-invalid={Boolean(err(i, "quantity"))}
                  onChange={(e) => update(i, { quantity: e.target.value })}
                />
                <Input value={scope.remarks} aria-invalid={Boolean(err(i, "remarks"))} onChange={(e) => update(i, { remarks: e.target.value })} placeholder="Optional" />
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={scopes.length === 1}
                  className="rounded-md p-2 text-ink-400 hover:bg-signal-50 hover:text-signal-600 disabled:opacity-30 dark:hover:bg-signal-500/10"
                  aria-label="Remove activity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {rowErrors.length > 0 && <FieldError>{`Row ${i + 1}: ${rowErrors.join(" · ")}`}</FieldError>}
            </div>
          );
        })}
      </div>
      <FieldError>{errors[prefix]}</FieldError>
      <button type="button" onClick={() => onChange([...scopes, emptyScope()])} className="mt-2 flex items-center gap-1.5 text-sm font-medium text-signal-600 hover:text-signal-700">
        <Plus className="h-3.5 w-3.5" />
        Add activity
      </button>
    </div>
  );
}
