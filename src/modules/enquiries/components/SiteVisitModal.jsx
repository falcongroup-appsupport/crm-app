import { useState } from "react";
import { Modal } from "../../../shared/components/ui/Modal";
import { useToast } from "../../../shared/components/feedback/toast/useToast";
import { Button } from "../../../shared/components/ui/Button";
import { Checkbox } from "../../../shared/components/forms/Checkbox";
import { Toggle } from "../../../shared/components/forms/Toggle";
import {
  FieldLabel,
  Input,
  Select,
  Textarea,
  FormRow,
} from "../../../shared/components/forms";
import {
  PROJECT_LEADS,
  REQUIRED_DOCUMENTS,
  DEFAULT_ASSIGNEE,
} from "../constants/enquiryStatus";

const emptyState = {
  appointment: "",
  contactPersonName: "",
  contactPersonNumber: "",
  meetingLocation: "",
  meetingAddress: "",
  safetyInduction: false,
  vehiclePass: false,
  instrumentPass: false,
  requiredDocuments: [],
  othersSpecify: "",
  assignedTo: DEFAULT_ASSIGNEE.siteVisit,
  emailNotification: true,
  remarks: "",
};

export function SiteVisitModal({
  open,
  onClose,
  enquiry,
  withPermits,
  onSubmit,
}) {
  const [form, setForm] = useState(emptyState);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const toggleDoc = (doc) =>
    setForm((f) => ({
      ...f,
      requiredDocuments: f.requiredDocuments.includes(doc)
        ? f.requiredDocuments.filter((d) => d !== doc)
        : [...f.requiredDocuments, doc],
    }));

  // The parent shows the success / error toast; on failure the modal stays open.
  const handleSubmit = async () => {
    if (!form.appointment) {
      toast.warning("Appointment is required", {
        description: "Pick the date and time for the site visit.",
      });
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ ...form, withPermits });
      handleClose();
    } catch {
      /* error toast already shown by the parent */
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm(emptyState);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Site visit form ${withPermits ? "(with permits)" : "(normal)"}`}
      subtitle={`Internal request will be sent to the concerned person's inbox · ${enquiry?.enquiryNo ?? ""}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? "Submitting…" : "Submit"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <FormRow>
          <div>
            <FieldLabel required>Appointment</FieldLabel>
            <Input
              required
              type="datetime-local"
              value={form.appointment}
              onChange={(e) => set({ appointment: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>Assigned to</FieldLabel>
            <Select
              value={form.assignedTo}
              onChange={(e) => set({ assignedTo: e.target.value })}
            >
              {PROJECT_LEADS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </div>
        </FormRow>
        <FormRow>
          <div>
            <FieldLabel>Contact person name</FieldLabel>
            <Input
              value={form.contactPersonName}
              onChange={(e) => set({ contactPersonName: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>Contact person number</FieldLabel>
            <Input
              value={form.contactPersonNumber}
              onChange={(e) => set({ contactPersonNumber: e.target.value })}
            />
          </div>
        </FormRow>
        <FormRow>
          <div>
            <FieldLabel>Meeting location</FieldLabel>
            <Input
              value={form.meetingLocation}
              onChange={(e) => set({ meetingLocation: e.target.value })}
              placeholder="Google Maps / weblink"
            />
          </div>
          <div>
            <FieldLabel>Meeting address</FieldLabel>
            <Input
              value={form.meetingAddress}
              onChange={(e) => set({ meetingAddress: e.target.value })}
            />
          </div>
        </FormRow>

        {withPermits && (
          <>
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-ink-50 p-3.5 dark:bg-ink-800">
              <Toggle
                label="Safety induction"
                checked={form.safetyInduction}
                onChange={(v) => set({ safetyInduction: v })}
              />
              <Toggle
                label="Vehicle pass"
                checked={form.vehiclePass}
                onChange={(v) => set({ vehiclePass: v })}
              />
              <Toggle
                label="Instrument pass"
                checked={form.instrumentPass}
                onChange={(v) => set({ instrumentPass: v })}
              />
            </div>

            <div>
              <FieldLabel>Required documents</FieldLabel>
              <div className="grid grid-cols-3 gap-2.5 rounded-lg bg-ink-50 p-3.5 dark:bg-ink-800">
                {REQUIRED_DOCUMENTS.map((doc) => (
                  <Checkbox
                    key={doc}
                    label={doc}
                    checked={form.requiredDocuments.includes(doc)}
                    onChange={() => toggleDoc(doc)}
                  />
                ))}
              </div>
              {form.requiredDocuments.includes("Others") && (
                <Input
                  className="mt-2"
                  placeholder="If others, please specify"
                  value={form.othersSpecify}
                  onChange={(e) => set({ othersSpecify: e.target.value })}
                />
              )}
            </div>
            <p className="text-xs italic text-ink-400">
              Document request will be automatically sent to the Document
              Controller.
            </p>
          </>
        )}

        <Toggle
          label="Email notification"
          checked={form.emailNotification}
          onChange={(v) => set({ emailNotification: v })}
        />

        <div>
          <FieldLabel>Remarks</FieldLabel>
          <Textarea
            rows={3}
            value={form.remarks}
            onChange={(e) => set({ remarks: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  );
}
