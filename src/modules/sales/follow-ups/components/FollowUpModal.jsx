import { useState } from "react";
import { Modal } from "../../../../shared/components/ui/Modal";
import { Button } from "../../../../shared/components/ui/Button";
import { FieldLabel, FormRow, Input, Select, Textarea } from "../../../../shared/components/forms";
import { ApiError } from "../../../../shared/api/axiosInstance";
import { FOLLOW_UP_STATUSES, FOLLOW_UP_TYPES } from "../constants/followUpConstants";

const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const initialState = (quotation) => ({
  date: nowLocal(),
  type: FOLLOW_UP_TYPES[0],
  currentStatus: FOLLOW_UP_STATUSES[0].value,
  contactPerson: quotation?.attentionTo ?? "",
  contactNumber: quotation?.contactNumber ?? "",
  response: "",
  reportedTo: "",
});

export function FollowUpModal({ open, onClose, quotation, onSubmit }) {
  const [form, setForm] = useState(() => initialState(quotation));
  const [wasOpen, setWasOpen] = useState(open);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fresh form (and current time) every time the modal opens.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setForm(initialState(quotation));
      setError(null);
    }
  }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ ...form, date: `${form.date}:00` });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the follow-up.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add follow-up"
      subtitle={quotation?.quotationReference}
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-signal-600 dark:text-signal-400">{error}</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit} disabled={saving || !form.response.trim()}>
              {saving ? "Saving…" : "Save follow-up"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <FormRow>
          <div>
            <FieldLabel required>Date &amp; time</FieldLabel>
            <Input type="datetime-local" value={form.date} onChange={(e) => set({ date: e.target.value })} />
          </div>
          <div>
            <FieldLabel>Type</FieldLabel>
            <Select value={form.type} onChange={(e) => set({ type: e.target.value })}>
              {FOLLOW_UP_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel>Status</FieldLabel>
            <Select value={form.currentStatus} onChange={(e) => set({ currentStatus: e.target.value })}>
              {FOLLOW_UP_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel>Reported to</FieldLabel>
            <Input value={form.reportedTo} onChange={(e) => set({ reportedTo: e.target.value })} />
          </div>
          <div>
            <FieldLabel>Contact person</FieldLabel>
            <Input value={form.contactPerson} onChange={(e) => set({ contactPerson: e.target.value })} />
          </div>
          <div>
            <FieldLabel>Contact number</FieldLabel>
            <Input value={form.contactNumber} onChange={(e) => set({ contactNumber: e.target.value })} />
          </div>
        </FormRow>
        <div>
          <FieldLabel required>Response</FieldLabel>
          <Textarea rows={3} value={form.response} onChange={(e) => set({ response: e.target.value })} placeholder="What did the customer say?" />
        </div>
      </div>
    </Modal>
  );
}
