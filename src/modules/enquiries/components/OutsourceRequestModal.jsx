import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "../../../shared/components/ui/Modal";
import { Button } from "../../../shared/components/ui/Button";
import { Toggle } from "../../../shared/components/forms/Toggle";
import { FieldLabel, Input, Select, Textarea, FormRow } from "../../../shared/components/forms";
import { PROJECT_LEADS, DEFAULT_ASSIGNEE } from "../constants/enquiryStatus";

const emptyState = {
  quotationRequiredBy: "",
  lineItems: [{ quantity: "", description: "" }],
  purpose: "",
  recommendedSupplier: "",
  availability: "",
  brand: "",
  remarks: "",
  assignedTo: DEFAULT_ASSIGNEE.outsource,
  emailNotification: true,
};

export function OutsourceRequestModal({ open, onClose, enquiry, onSubmit }) {
  const [form, setForm] = useState(emptyState);
  const [submitted, setSubmitted] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const updateItem = (i, patch) =>
    setForm((f) => ({ ...f, lineItems: f.lineItems.map((li, idx) => (idx === i ? { ...li, ...patch } : li)) }));
  const addItem = () => set({ lineItems: [...form.lineItems, { quantity: "", description: "" }] });
  const removeItem = (i) => set({ lineItems: form.lineItems.filter((_, idx) => idx !== i) });

  const handleSubmit = () => {
    onSubmit(form);
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm(emptyState);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Outsource request"
      subtitle={`Internal request will be sent to the concerned person's inbox · ${enquiry?.enquiryNo ?? ""}`}
      footer={
        submitted ? (
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-600">Request submitted successfully</p>
            <Button size="sm" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        )
      }
    >
      {submitted ? (
        <p className="text-sm text-ink-500">
          The outsource request has been logged against {enquiry?.enquiryNo} and sent to {form.assignedTo}.
        </p>
      ) : (
        <div className="space-y-4">
          <FieldLabel>Quotation required on/before</FieldLabel>
          <Input type="date" value={form.quotationRequiredBy} onChange={(e) => set({ quotationRequiredBy: e.target.value })} />

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink-700">Line items</p>
            <div className="grid grid-cols-[1fr_3fr_auto] gap-2 pb-1 text-xs font-medium text-ink-400">
              <span>Quantity</span>
              <span>Description</span>
              <span />
            </div>
            <div className="space-y-2">
              {form.lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_3fr_auto] items-center gap-2">
                  <Input value={item.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value })} placeholder="Qty" />
                  <Input value={item.description} onChange={(e) => updateItem(i, { description: e.target.value })} placeholder="Description" />
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    disabled={form.lineItems.length === 1}
                    className="rounded-md p-2 text-ink-400 hover:bg-signal-50 hover:text-signal-600 disabled:opacity-30 dark:hover:bg-signal-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-2 flex items-center gap-1.5 text-sm font-medium text-signal-600 hover:text-signal-700">
              <Plus className="h-3.5 w-3.5" />
              Add line item
            </button>
          </div>

          <div>
            <FieldLabel>Purpose</FieldLabel>
            <Textarea rows={2} value={form.purpose} onChange={(e) => set({ purpose: e.target.value })} />
          </div>

          <FormRow>
            <div>
              <FieldLabel>Recommended supplier</FieldLabel>
              <Input value={form.recommendedSupplier} onChange={(e) => set({ recommendedSupplier: e.target.value })} />
            </div>
            <div>
              <FieldLabel>Availability</FieldLabel>
              <Input value={form.availability} onChange={(e) => set({ availability: e.target.value })} />
            </div>
          </FormRow>

          <FormRow>
            <div>
              <FieldLabel>Brand (if applicable)</FieldLabel>
              <Input value={form.brand} onChange={(e) => set({ brand: e.target.value })} />
            </div>
            <div>
              <FieldLabel>Assigned to</FieldLabel>
              <Select value={form.assignedTo} onChange={(e) => set({ assignedTo: e.target.value })}>
                <option>{DEFAULT_ASSIGNEE.outsource}</option>
                {PROJECT_LEADS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            </div>
          </FormRow>

          <div>
            <FieldLabel>Remarks</FieldLabel>
            <Textarea rows={2} value={form.remarks} onChange={(e) => set({ remarks: e.target.value })} />
          </div>

          <Toggle label="Email notification" checked={form.emailNotification} onChange={(v) => set({ emailNotification: v })} />
        </div>
      )}
    </Modal>
  );
}
