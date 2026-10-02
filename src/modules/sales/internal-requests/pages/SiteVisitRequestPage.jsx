import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Pencil,
  Save,
  X,
  Download,
  FolderOpen,
} from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";
import { Tabs } from "../../../../shared/components/ui/Tabs";
import { Modal } from "../../../../shared/components/ui/Modal";
import {
  FieldLabel,
  Input,
  Select,
  Textarea,
} from "../../../../shared/components/forms";
import { useInternalRequests } from "../hooks/useInternalRequests";
import { useToast } from "../../../../shared/components/feedback/toast/useToast";
import { formatDateTime } from "../../../../shared/utils";

const TABS = [
  { key: "info", label: "Site visit information" },
  { key: "permits", label: "Permits / gate pass" },
  { key: "updates", label: "Site visit updates" },
];

function ReadRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-ink-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink-900 dark:text-ink-50">
        {value || "—"}
      </p>
    </div>
  );
}

export default function SiteVisitRequestPage() {
  const toast = useToast();
  const { id } = useParams();
  const { requests, updateRequest, cancelRequest } = useInternalRequests();
  const request = requests.find((r) => r.id === id);

  const [tab, setTab] = useState("info");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(request?.detail || {});
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [visitStatus, setVisitStatus] = useState(
    request?.visitStatus || "Pending",
  );

  if (!request) {
    return (
      <div className="p-8 text-sm text-ink-400">
        Request not found.{" "}
        <Link to="/requests" className="text-signal-600 underline">
          Back to internal requests
        </Link>
      </div>
    );
  }

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const saveChanges = () => {
    updateRequest(request.id, { detail: draft });
    setEditing(false);
    toast.success("Request updated", { description: request.requestNumber });
  };

  const confirmCancel = () => {
    cancelRequest(request.id, cancelReason);
    setCancelOpen(false);
    setCancelReason("");
    toast.info("Request cancelled", { description: request.requestNumber });
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <Link
          to="/requests"
          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-mono text-lg font-semibold text-ink-950 dark:text-white">
            {request.requestNumber}
          </h1>
          <p className="text-sm text-ink-400">
            {request.nameOfCustomer} · Ref {request.referenceNumber}
          </p>
        </div>
        <span
          className={`ml-auto rounded-full px-2.5 py-1 text-xs font-medium ${
            request.currentStatus === "OPEN"
              ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30"
              : request.currentStatus === "CANCELLED"
                ? "bg-ink-100 text-ink-500 ring-1 ring-inset ring-ink-200 dark:bg-ink-700 dark:text-ink-400 dark:ring-ink-600"
                : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30"
          }`}
        >
          {request.currentStatus}
        </span>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "info" && (
        <div className="space-y-5 rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
          {!editing ? (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(max(14rem,calc((100%_-_3rem)/4)),1fr))] gap-4">
                <ReadRow
                  label="Appointment"
                  value={draft.appointment && formatDateTime(draft.appointment)}
                />
                <ReadRow
                  label="Contact person"
                  value={draft.contactPersonName}
                />
                <ReadRow
                  label="Contact number"
                  value={draft.contactPersonNumber}
                />
                <ReadRow
                  label="Meeting location"
                  value={draft.meetingLocation}
                />
                <ReadRow label="Meeting address" value={draft.meetingAddress} />
                <ReadRow label="Assigned to" value={draft.assignedTo} />
                <ReadRow
                  label="Request creation time"
                  value={formatDateTime(request.creationDate)}
                />
                <ReadRow label="Current status" value={request.currentStatus} />
              </div>
              <ReadRow label="Remarks" value={draft.remarks} />

              {request.currentStatus === "OPEN" && (
                <div className="flex gap-2 border-t border-ink-100 pt-4 dark:border-ink-800">
                  <Button size="sm" onClick={() => setEditing(true)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setCancelOpen(true)}
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel request
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(max(14rem,calc((100%_-_3rem)/4)),1fr))] gap-4">
                <div>
                  <FieldLabel>Appointment</FieldLabel>
                  <Input
                    type="datetime-local"
                    value={draft.appointment || ""}
                    onChange={(e) => set({ appointment: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Assigned to</FieldLabel>
                  <Input
                    value={draft.assignedTo || ""}
                    onChange={(e) => set({ assignedTo: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Contact person</FieldLabel>
                  <Input
                    value={draft.contactPersonName || ""}
                    onChange={(e) => set({ contactPersonName: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Contact number</FieldLabel>
                  <Input
                    value={draft.contactPersonNumber || ""}
                    onChange={(e) =>
                      set({ contactPersonNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <FieldLabel>Meeting location</FieldLabel>
                  <Input
                    value={draft.meetingLocation || ""}
                    onChange={(e) => set({ meetingLocation: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Meeting address</FieldLabel>
                  <Input
                    value={draft.meetingAddress || ""}
                    onChange={(e) => set({ meetingAddress: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Remarks</FieldLabel>
                <Textarea
                  rows={3}
                  value={draft.remarks || ""}
                  onChange={(e) => set({ remarks: e.target.value })}
                />
              </div>
              <div className="flex gap-2 border-t border-ink-100 pt-4 dark:border-ink-800">
                <Button size="sm" onClick={saveChanges}>
                  <Save className="h-3.5 w-3.5" />
                  Save changes
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "permits" && (
        <div className="rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
          <p className="mb-1 text-xs font-semibold tracking-wide text-ink-400">
            Documents uploaded by the Document Controller against this permit
            request
          </p>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-ink-200 py-12 text-center dark:border-ink-700">
            <FolderOpen className="h-6 w-6 text-ink-300" />
            <p className="mt-2 text-sm text-ink-400">
              No documents uploaded yet.
            </p>
          </div>
          <Button size="sm" variant="secondary" className="mt-3" disabled>
            <Download className="h-3.5 w-3.5" />
            Download files
          </Button>
        </div>
      )}

      {tab === "updates" && (
        <div className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
          <p className="text-xs font-semibold tracking-wide text-ink-400">
            Based on updates from the site schedule
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(max(14rem,calc((100%_-_3rem)/4)),1fr))] gap-4">
            <ReadRow label="Site visit assigned to" value={draft.assignedTo} />
            <ReadRow label="Contact number" value={draft.contactPersonNumber} />
            <div>
              <p className="text-xs text-ink-400">Site visit status</p>
              <Select
                className="mt-1"
                value={visitStatus}
                onChange={(e) => setVisitStatus(e.target.value)}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </Select>
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-ink-400">
              Documents uploaded by the surveyor against this request
            </p>
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-ink-200 py-12 text-center dark:border-ink-700">
              <FolderOpen className="h-6 w-6 text-ink-300" />
              <p className="mt-2 text-sm text-ink-400">
                No documents uploaded yet.
              </p>
            </div>
            <Button size="sm" variant="secondary" className="mt-3" disabled>
              <Download className="h-3.5 w-3.5" />
              Download files
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Request cancellation"
        width="max-w-sm"
        footer={
          <Button
            variant="danger"
            size="sm"
            onClick={confirmCancel}
            disabled={!cancelReason.trim()}
            className="w-full justify-center"
          >
            <X className="h-3.5 w-3.5" />
            Cancel request
          </Button>
        }
      >
        <FieldLabel required>Reason for cancellation</FieldLabel>
        <Textarea
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          autoFocus
        />
      </Modal>
    </div>
  );
}
