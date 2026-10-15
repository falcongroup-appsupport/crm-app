import { Plus, Trash2 } from "lucide-react";
import { FieldError, Input, Select } from "../../../../shared/components/forms";
import { SCOPE_UNITS } from "../../../enquiries/constants/enquiryStatus";
import { formatCurrency } from "../../../../shared/utils";
import { computeItem, emptyItem } from "../schemas/quotation.schema";

const COLS =
  "grid-cols-[minmax(11rem,1.5fr)_minmax(12rem,2fr)_5.5rem_5.5rem_7rem_5rem_8rem_2rem]";
const FIELDS = [
  "activityId",
  "itemDescription",
  "unit",
  "quantity",
  "rate",
  "vatPercentage",
];

/** errors: the form's error map (keys like items.0.rate). */
export function QuotationItemsTable({
  items,
  activities,
  currency,
  onChange,
  errors = {},
}) {
  const update = (i, patch) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const err = (i, f) => errors[`items.${i}.${f}`];

  const pickActivity = (i, value) => {
    const activity = activities.find((a) => String(a.activityId ?? a.id) === value);
    const patch = { activityId: value, activityName: activity?.activityName ?? "" };
    if (!items[i].itemDescription && activity)
      patch.itemDescription = activity.activityName;
    update(i, patch);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-[980px] space-y-2">
          <div className={`grid ${COLS} gap-2 pb-1 text-xs font-medium text-ink-400`}>
            <span>Activity *</span>
            <span>Description *</span>
            <span>Unit *</span>
            <span>Qty *</span>
            <span>Rate *</span>
            <span>VAT %</span>
            <span className="text-right">Total (incl. VAT)</span>
            <span />
          </div>
          {items.map((item, i) => {
            const rowErrors = FIELDS.map((f) => err(i, f)).filter(Boolean);
            // keep a saved unit / activity selectable even if it isn't in the current lists
            const units =
              SCOPE_UNITS.includes(item.unit) || !item.unit
                ? SCOPE_UNITS
                : [item.unit, ...SCOPE_UNITS];
            const knownActivity = activities.some(
              (a) => String(a.activityId ?? a.id) === String(item.activityId),
            );
            return (
              <div key={i}>
                <div className={`grid ${COLS} items-center gap-2`}>
                  <Select
                    value={item.activityId}
                    aria-invalid={Boolean(err(i, "activityId"))}
                    onChange={(e) => pickActivity(i, e.target.value)}
                  >
                    <option value="">Select activity…</option>
                    {item.activityId && !knownActivity && (
                      <option value={item.activityId}>
                        {item.activityName || `Activity #${item.activityId}`}
                      </option>
                    )}
                    {activities.map((a) => (
                      <option key={a.activityId ?? a.id} value={a.activityId ?? a.id}>
                        {a.activityName}
                      </option>
                    ))}
                  </Select>
                  <Input
                    value={item.itemDescription}
                    aria-invalid={Boolean(err(i, "itemDescription"))}
                    onChange={(e) => update(i, { itemDescription: e.target.value })}
                    placeholder="Item description"
                  />
                  <Select
                    value={item.unit}
                    aria-invalid={Boolean(err(i, "unit"))}
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
                    value={item.quantity}
                    aria-invalid={Boolean(err(i, "quantity"))}
                    onChange={(e) => update(i, { quantity: e.target.value })}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={item.rate}
                    aria-invalid={Boolean(err(i, "rate"))}
                    onChange={(e) => update(i, { rate: e.target.value })}
                  />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={item.vatPercentage}
                    aria-invalid={Boolean(err(i, "vatPercentage"))}
                    onChange={(e) => update(i, { vatPercentage: e.target.value })}
                  />
                  <p className="text-right text-sm font-medium tabular text-ink-900 dark:text-ink-50">
                    {formatCurrency(computeItem(item).totalAED, currency)}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    disabled={items.length === 1}
                    className="rounded-md p-1.5 text-ink-400 hover:bg-signal-50 hover:text-signal-600 disabled:opacity-30 dark:hover:bg-signal-500/10"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {rowErrors.length > 0 && (
                  <FieldError>{`Item ${i + 1}: ${rowErrors.join(" · ")}`}</FieldError>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <FieldError>{errors.items}</FieldError>
      <button
        type="button"
        onClick={() => onChange([...items, emptyItem()])}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-signal-600 hover:text-signal-700"
      >
        <Plus className="h-3.5 w-3.5" />
        Add item
      </button>
    </div>
  );
}
