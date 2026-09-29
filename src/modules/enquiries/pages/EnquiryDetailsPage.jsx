import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Pencil, Trash2, FileText, Download, Send } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Select } from "../../../shared/components/forms";
import { StatusBadge, ProjectStatusPill } from "../components/StatusBadge";
import { ConfirmDialog } from "../../../shared/components/feedback/ConfirmDialog";
import { SiteVisitModal } from "../components/SiteVisitModal";
import { OutsourceRequestModal } from "../components/OutsourceRequestModal";
import { CloseEnquiryModal } from "../components/CloseEnquiryModal";
import { useEnquiries } from "../hooks/useEnquiries";
import { useInternalRequests } from "../../sales/internal-requests/hooks/useInternalRequests";
import { enquiryApi } from "../api/enquiry.api";
import { ApiError } from "../../../shared/api/axiosInstance";
import { formatDate, formatDateTime } from "../../../shared/utils";

const ACTIONS = [
  { value: "", label: "Select…" },
  { value: "CREATE_QUOTATION", label: "Create sales quotation" },
  { value: "SEND_ESTIMATION", label: "Send for estimation" },
  { value: "SITE_VISIT_NORMAL", label: "Arrange site visit (normal)" },
  { value: "SITE_VISIT_PERMIT", label: "Arrange site visit (with permits)" },
  { value: "OUTSOURCE", label: "Outsource request" },
  { value: "CLOSE", label: "Close enquiry" },
];

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-ink-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-ink-900 dark:text-ink-50">{value || "—"}</p>
    </div>
  );
}

export default function EnquiryDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteEnquiry, setSiteVisit, closeEnquiryLocally } = useEnquiries();
  const { createRequest } = useInternalRequests();

  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [action, setAction] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadError(null);
      try {
        const data = await enquiryApi.getById(id);
        setEnquiry(data);
      } catch (err) {
        setEnquiry(null);
        setLoadError(err instanceof ApiError ? err.message : "Could not load this enquiry.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-8 text-sm text-ink-400">Loading enquiry…</div>;
  if (loadError) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-8">
        <p className="rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
          {loadError}
        </p>
        <Link to="/enquiries" className="text-sm font-medium text-signal-600 hover:text-signal-700">
          Back to enquiries
        </Link>
      </div>
    );
  }
  if (!enquiry) return <div className="p-8 text-sm text-ink-400">Enquiry not found.</div>;

  const runAction = () => {
    if (pendingAction === "CREATE_QUOTATION" || pendingAction === "SEND_ESTIMATION") {
      // No sales-quotation/estimation module or API documented yet.
      alert("This opens the Sales Quotation module once that screen and API are available.");
      setPendingAction("");
      return;
    }
    setAction(pendingAction);
  };

  const handleSiteVisitSubmit = async (data) => {
    createRequest({
      referenceNumber: enquiry.projectReference || enquiry.enquiryNo,
      typeOfRequest: data.withPermits ? "SITE_VISIT_WITH_PERMIT" : "SITE_VISIT",
      nameOfCustomer: enquiry.customerName,
      remarks: data.remarks,
      enquiryId: enquiry.id,
      detail: data,
    });
    await setSiteVisit(enquiry.id, {
      siteVisitRequired: true,
      gatePassRequired: data.withPermits,
      siteVisitAssignedTo: data.assignedTo,
      siteVisitDate: data.appointment,
      contactPerson: data.contactPersonName,
      contactNumber: data.contactPersonNumber,
      googleMapLink: data.meetingLocation,
    });
    setEnquiry((e) => ({ ...e, currentStatus: "SITE_VISIT_REQUIRED" }));
  };

  const handleOutsourceSubmit = (data) => {
    createRequest({
      referenceNumber: enquiry.projectReference || enquiry.enquiryNo,
      typeOfRequest: "OUTSOURCE_REQUEST",
      nameOfCustomer: enquiry.customerName,
      remarks: data.purpose,
      enquiryId: enquiry.id,
      detail: data,
    });
  };

  const handleClose = (remarks) => {
    closeEnquiryLocally(enquiry.id, remarks);
    setEnquiry((e) => ({ ...e, closedLocally: true, closeRemarks: remarks }));
    setAction("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/enquiries" className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-lg font-semibold text-ink-950 dark:text-white">{enquiry.enquiryNo}</h1>
              <StatusBadge status={enquiry.currentStatus} />
              {enquiry.closedLocally && (
                <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-500 dark:bg-ink-700 dark:text-ink-300">Closed</span>
              )}
            </div>
            <p className="text-sm text-ink-400">{enquiry.customerName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/enquiries/${id}/edit`)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmingDelete(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800 sm:grid-cols-3">
        <Field label="Created at" value={formatDateTime(enquiry.createdAt)} />
        <Field label="Enquiry lead" value={enquiry.projectLead} />
        <Field label="Enquiry date" value={formatDate(enquiry.dateOfEnquiry)} />
        <Field label="Submission deadline" value={enquiry.submissionDeadline ? formatDate(enquiry.submissionDeadline) : "—"} />
        <Field label="Contact person" value={enquiry.contactPerson} />
        <Field label="Contact number" value={enquiry.contactNumber} />
        <Field label="Customer email" value={enquiry.customerEmail} />
        <div>
          <p className="text-xs text-ink-400">Project status</p>
          <div className="mt-1">
            <ProjectStatusPill status={enquiry.projectStatus} />
          </div>
        </div>
        <Field label="Project reference" value={enquiry.projectReference} />
      </section>

      {(enquiry.projectInformations || []).map((project, i) => (
        <section key={i} className="rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
          <p className="mb-3 text-xs font-semibold tracking-wide text-ink-400">
            Project information {(enquiry.projectInformations || []).length > 1 ? `#${i + 1}` : ""}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Project name" value={project.projectName} />
            <Field label="Country" value={project.country} />
            <Field label="Emirate" value={project.emirate} />
          </div>
          <div className="mt-4 overflow-hidden rounded-lg ring-1 ring-ink-100 dark:ring-ink-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-ink-50 text-xs text-ink-400 dark:bg-ink-800">
                  <th className="px-3 py-2 font-medium">Activity</th>
                  <th className="px-3 py-2 font-medium">Unit</th>
                  <th className="px-3 py-2 font-medium">Quantity</th>
                  <th className="px-3 py-2 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {(project.scopeOfServices || []).map((scope, j) => (
                  <tr key={j} className="border-t border-ink-50">
                    <td className="px-3 py-2 font-medium text-ink-900 dark:text-ink-50">{scope.activityName}</td>
                    <td className="px-3 py-2 text-ink-600 dark:text-ink-300">{scope.unit}</td>
                    <td className="px-3 py-2 text-ink-600 dark:text-ink-300">{scope.quantity}</td>
                    <td className="px-3 py-2 text-ink-500">{scope.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
        <p className="mb-3 text-xs font-semibold tracking-wide text-ink-400">Attachments ({enquiry.attachments?.length || 0})</p>
        {enquiry.attachments?.length ? (
          <ul className="divide-y divide-ink-50 dark:divide-ink-800">
            {enquiry.attachments.map((att, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-ink-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900 dark:text-ink-50">{att.fileName || att.file?.name}</p>
                    <p className="text-xs text-ink-400">{att.fileType} · {formatDateTime(att.lastModifiedDate)}</p>
                  </div>
                </div>
                <button className="shrink-0 rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white">
                  <Download className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-400">No attachments.</p>
        )}
      </section>

      <section className="rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
        <p className="mb-3 text-xs font-semibold tracking-wide text-ink-400">Site visit information</p>
        {enquiry.siteVisit?.siteVisitRequired ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Assigned to" value={enquiry.siteVisit.siteVisitAssignedTo} />
            <Field label="Visit date" value={enquiry.siteVisit.siteVisitDate ? formatDateTime(enquiry.siteVisit.siteVisitDate) : "—"} />
            <Field label="Gate pass" value={enquiry.siteVisit.gatePassRequired ? "Required" : "Not required"} />
            <Field label="Contact person" value={enquiry.siteVisit.contactPerson} />
            <Field label="Contact number" value={enquiry.siteVisit.contactNumber} />
            <Field label="Google map link" value={enquiry.siteVisit.googleMapLink} />
          </div>
        ) : (
          <p className="text-sm font-medium text-ink-400">*Not provided*</p>
        )}
      </section>

      {enquiry.closedLocally && (
        <section className="rounded-xl bg-ink-50 p-5 ring-1 ring-ink-100 dark:bg-ink-800 dark:ring-ink-700">
          <p className="text-xs font-semibold tracking-wide text-ink-400">Closure remarks</p>
          <p className="mt-1 text-sm text-ink-700 dark:text-ink-300">{enquiry.closeRemarks}</p>
        </section>
      )}

      <section className="rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
        <p className="mb-3 text-xs font-semibold tracking-wide text-ink-400">Choose your action</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={pendingAction} onChange={(e) => setPendingAction(e.target.value)} className="sm:w-72">
            {ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
          <Button disabled={!pendingAction} onClick={runAction}>
            <Send className="h-4 w-4" />
            Submit
          </Button>
        </div>
      </section>

      <SiteVisitModal
        open={action === "SITE_VISIT_NORMAL" || action === "SITE_VISIT_PERMIT"}
        withPermits={action === "SITE_VISIT_PERMIT"}
        enquiry={enquiry}
        onClose={() => {
          setAction("");
          setPendingAction("");
        }}
        onSubmit={handleSiteVisitSubmit}
      />
      <OutsourceRequestModal
        open={action === "OUTSOURCE"}
        enquiry={enquiry}
        onClose={() => {
          setAction("");
          setPendingAction("");
        }}
        onSubmit={handleOutsourceSubmit}
      />
      <CloseEnquiryModal
        open={action === "CLOSE"}
        enquiry={enquiry}
        onClose={() => {
          setAction("");
          setPendingAction("");
        }}
        onSubmit={handleClose}
      />

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this enquiry?"
        description={`${enquiry.enquiryNo} · ${enquiry.customerName} will be permanently removed.`}
        confirmLabel="Delete"
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={async () => {
          await deleteEnquiry(enquiry.id);
          navigate("/enquiries");
        }}
      />
    </div>
  );
}
