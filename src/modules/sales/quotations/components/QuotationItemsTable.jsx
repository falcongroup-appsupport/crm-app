import { Plus, Trash2 } from "lucide-react";
import { Input, Select } from "../../../../shared/components/forms";
import { SCOPE_UNITS } from "../../../enquiries/constants/enquiryStatus";
import { formatCurrency } from "../../../../shared/utils";
import { computeItem, emptyItem } from "../schemas/quotation.schema";

const COLS =
  "grid-cols-[minmax(11rem,1.5fr)_minmax(12rem,2fr)_5rem_5.5rem_7rem_5rem_7.5rem_2rem]";

export function QuotationItemsTable({ items, activities, currency, onChange }) {
  const update = (i, patch) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  const pickActivity = (i, value) => {
    const activity = activities.find(
      (a) => String(a.activityId ?? a.id) === value,
    );
    const patch = {
      activityId: value,
      activityName: activity?.activityName ?? "",
    };
    if (!items[i].itemDescription && activity)
      patch.itemDescription = activity.activityName;
    update(i, patch);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-240 space-y-2">
          <div
            className={`grid ${COLS} gap-2 pb-1 text-xs font-medium text-ink-400`}
          >
            <span>Activity</span>
            <span>Description</span>
            <span>Unit</span>
            <span>Qty</span>
            <span>Rate</span>
            <span>VAT %</span>
            <span className="text-right">Total (incl. VAT)</span>
            <span />
          </div>
          {items.map((item, i) => (
            <div key={i} className={`grid ${COLS} items-center gap-2`}>
              <Select
                value={item.activityId}
                onChange={(e) => pickActivity(i, e.target.value)}
              >
                <option value="">Select activity…</option>
                {activities.map((a) => (
                  <option
                    key={a.activityId ?? a.id}
                    value={a.activityId ?? a.id}
                  >
                    {a.activityName}
                  </option>
                ))}
              </Select>
              <Input
                value={item.itemDescription}
                onChange={(e) => update(i, { itemDescription: e.target.value })}
                placeholder="Item description"
              />
              <Select
                value={item.unit}
                onChange={(e) => update(i, { unit: e.target.value })}
              >
                {SCOPE_UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </Select>
              <Input
                type="number"
                min="0"
                step="any"
                value={item.quantity}
                onChange={(e) => update(i, { quantity: e.target.value })}
              />
              <Input
                type="number"
                min="0"
                step="any"
                value={item.rate}
                onChange={(e) => update(i, { rate: e.target.value })}
              />
              <Input
                type="number"
                min="0"
                step="any"
                value={item.vatPercentage}
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
          ))}
        </div>
      </div>
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
