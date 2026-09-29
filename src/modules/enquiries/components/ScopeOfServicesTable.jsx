import { Plus, Trash2 } from "lucide-react";
import { Select, Input } from "../../../shared/components/forms";
import { SCOPE_UNITS } from "../constants/enquiryStatus";

export function ScopeOfServicesTable({ scopes, activities, onChange }) {
  const update = (index, patch) => {
    onChange(scopes.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addRow = () => onChange([...scopes, { activityId: "", unit: "LS", quantity: 1, remarks: "" }]);
  const removeRow = (index) => onChange(scopes.filter((_, i) => i !== index));

  return (
    <div>
      <div className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 pb-1.5 text-xs font-medium text-ink-400">
        <span>Activity name</span>
        <span>Unit</span>
        <span>Quantity</span>
        <span>Remarks</span>
        <span />
      </div>
      <div className="space-y-2">
        {scopes.map((scope, i) => (
          <div key={i} className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] items-center gap-2">
            <Select
              value={scope.activityId}
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
            <Select value={scope.unit} onChange={(e) => update(i, { unit: e.target.value })}>
              {SCOPE_UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </Select>
            <Input type="number" min="0" value={scope.quantity} onChange={(e) => update(i, { quantity: e.target.value })} />
            <Input value={scope.remarks} onChange={(e) => update(i, { remarks: e.target.value })} placeholder="Optional" />
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={scopes.length === 1}
              className="rounded-md p-2 text-ink-400 hover:bg-signal-50 hover:text-signal-600 disabled:opacity-30 dark:hover:bg-signal-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 flex items-center gap-1.5 text-sm font-medium text-signal-600 hover:text-signal-700"
      >
        <Plus className="h-3.5 w-3.5" />
        Add activity
      </button>
    </div>
  );
}
