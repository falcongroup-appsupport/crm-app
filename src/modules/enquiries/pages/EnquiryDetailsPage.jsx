import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Send,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { ReadField } from "../../../shared/components/ui/ReadField";
import { Select } from "../../../shared/components/forms";
import { Loader } from "../../../shared/components/feedback/Loader";
import { formatDate, formatDateTime } from "../../../shared/utils";
import { StatusBadge, ProjectStatusPill } from "../components/StatusBadge";
import { AttachmentList } from "../components/AttachmentList";
import { SiteVisitModal } from "../components/SiteVisitModal";
import { OutsourceRequestModal } from "../components/OutsourceRequestModal";
import { CloseEnquiryModal } from "../components/CloseEnquiryModal";
import { useEnquiry } from "../hooks/useEnquiry";
import { useEnquiries } from "../hooks/useEnquiries";
import { useInternalRequests } from "../../sales/internal-requests/hooks/useInternalRequests";
import { useToast } from "../../../shared/components/feedback/toast/useToast";

const ACTIONS = [
  { value: "", label: "Select…" },
  { value: "CREATE_QUOTATION", label: "Create sales quotation" },
  { value: "SEND_ESTIMATION", label: "Send for estimation" },
  { value: "SITE_VISIT_NORMAL", label: "Arrange site visit (normal)" },
  { value: "SITE_VISIT_PERMIT", label: "Arrange site visit (with permits)" },
  { value: "OUTSOURCE", label: "Outsource request" },
  { value: "CLOSE", label: "Close enquiry" },
];

const CARD =
  "rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800";
const TITLE = "mb-4 text-xs font-semibold uppercase tracking-wide text-ink-400";
const GRID =
  "grid grid-cols-[repeat(auto-fill,minmax(max(14rem,calc((100%_-_3rem)/4)),1fr))] gap-x-4 gap-y-5";
const LINK =
  "inline-flex items-center gap-1.5 text-signal-600 hover:text-signal-700 dark:text-signal-400";

const leadLabel = (lead) => (!lead || lead === "NO_LEAD" ? "No lead" : lead);

function DeadlineHint({ date }) {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((new Date(`${date}T00:00:00`) - today) / 86_400_000);
  const text =
    days < 0
      ? `overdue by ${-days} day${days === -1 ? "" : "s"}`
      : days === 0
        ? "due today"
        : `in ${days} day${days === 1 ? "" : "s"}`;
  const tone =
    days < 0
      ? "text-signal-600 dark:text-signal-400"
      : days <= 3
        ? "text-amber-600 dark:text-amber-400"
        : "text-ink-400";
  return <span className={`ml-2 text-xs font-normal ${tone}`}>({text})</span>;
}

export default function EnquiryDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { enquiry, loading, error, refresh } = useEnquiry(id);
  const { setSiteVisit } = useEnquiries();
  const { createRequest } = useInternalRequests();

  const [action, setAction] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [closure, setClosure] = useState(null); // local only — no close endpoint yet

  if (loading) return <Loader label="Loading enquiry…" />;
  if (error || !enquiry) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-8">
        <p className="rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
          {error || "Enquiry not found."}
        </p>
        <Link
          to="/enquiries"
          className="text-sm font-medium text-signal-600 hover:text-signal-700"
        >
          Back to enquiries
        </Link>
      </div>
    );
  }

  const projects = enquiry.projectInformations ?? [];
  const activityCount = projects.reduce(
    (n, p) => n + (p.scopeOfServices?.length ?? 0),
    0,
  );
  const sv = enquiry.siteVisit;
  const files = [...(enquiry.attachments ?? []), ...(sv?.attachments ?? [])];

  const closeModal = () => {
    setAction("");
    setPendingAction("");
  };

  const runAction = () => {
    if (pendingAction === "CREATE_QUOTATION") {
      navigate(`/enquiries/${id}/quotation`);
      return;
    }
    if (pendingAction === "SEND_ESTIMATION") {
      toast.info("Estimation isn't built yet", {
        description:
          "It will open here once that screen and API are available.",
      });
      setPendingAction("");
      return;
    }
    setAction(pendingAction);
  };

  const handleSiteVisitSubmit = async (data) => {
    createRequest({
      referenceNumber: enquiry.projectReference || enquiry.enquiryNo,
      typeOfRequest: data.withPermits ? "SITE_VISIT_WITH_PERMIT" : "SITE_VISIT",
      nameOfCustomer: enquiry.companyName,
      remarks: data.remarks,
      enquiryId: enquiry.id,
      detail: data,
    });
    try {
      await setSiteVisit(enquiry.id, {
        siteVisitRequired: true,
        gatePassRequired: data.withPermits,
        siteVisitAssignedTo: data.assignedTo,
        siteVisitDate: data.appointment,
        contactPerson: data.contactPersonName,
        contactNumber: data.contactPersonNumber,
        googleMapLink: data.meetingLocation,
      });
      await refresh();
      toast.success("Site visit arranged", {
        description: `${enquiry.enquiryNo} is now marked Site Visit Required`,
      });
    } catch (err) {
      toast.error("Couldn't arrange the site visit", {
        description: err?.message || "Please try again.",
      });
      throw err;
    }
  };

  const handleOutsourceSubmit = (data) => {
    createRequest({
      referenceNumber: enquiry.projectReference || enquiry.enquiryNo,
      typeOfRequest: "OUTSOURCE_REQUEST",
      nameOfCustomer: enquiry.companyName,
      remarks: data.purpose,
      enquiryId: enquiry.id,
      detail: data,
    });
    toast.success("Outsource request sent", {
      description: `Assigned to ${data.assignedTo}`,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link
            to="/enquiries"
            className="mt-0.5 rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-lg font-semibold text-ink-950 dark:text-white">
                {enquiry.enquiryNo}
              </h1>
              <StatusBadge status={enquiry.currentStatus} />
              <ProjectStatusPill status={enquiry.projectStatus} />
              {closure && (
                <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-500 dark:bg-ink-700 dark:text-ink-300">
                  Closed
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              {enquiry.companyName} ·{" "}
              {enquiry.contactPerson || enquiry.customerName}
            </p>
            <p className="mt-0.5 text-xs text-ink-400">
              Created {formatDateTime(enquiry.createdAt)}
              {enquiry.updatedAt &&
                enquiry.updatedAt !== enquiry.createdAt &&
                ` · Updated ${formatDateTime(enquiry.updatedAt)}`}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => navigate(`/enquiries/${id}/edit`)}>
          <Pencil className="h-4 w-4" />
          Edit enquiry
        </Button>
      </div>

      {/* customer / client */}
      <section className={CARD}>
        <p className={TITLE}>Customer / Client details</p>
        <div className={GRID}>
          <ReadField label="Company name" value={enquiry.companyName} />
          <ReadField
            label="Contact person"
            value={enquiry.contactPerson || enquiry.customerName}
          />
          <ReadField label="Contact number">
            {enquiry.contactNumber ? (
              <a href={`tel:${enquiry.contactNumber}`} className={LINK}>
                <Phone className="h-3.5 w-3.5" />
                {enquiry.contactNumber}
              </a>
            ) : (
              "—"
            )}
          </ReadField>
          <ReadField label="Email">
            {enquiry.customerEmail ? (
              <a
                href={`mailto:${enquiry.customerEmail}`}
                className={`${LINK} break-all`}
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {enquiry.customerEmail}
              </a>
            ) : (
              "—"
            )}
          </ReadField>
        </div>
      </section>

      {/* enquiry details */}
      <section className={CARD}>
        <p className={TITLE}>Enquiry details</p>
        <div className={GRID}>
          <ReadField label="Enquiry number" value={enquiry.enquiryNo} />
          <ReadField
            label="Enquiry date"
            value={formatDate(enquiry.dateOfEnquiry)}
          />
          <ReadField label="Submission deadline">
            {enquiry.submissionDeadline ? (
              <>
                {formatDate(enquiry.submissionDeadline)}
                <DeadlineHint date={enquiry.submissionDeadline} />
              </>
            ) : (
              "—"
            )}
          </ReadField>
          <ReadField
            label="Enquiry lead"
            value={leadLabel(enquiry.projectLead)}
          />
          <ReadField
            label="Project reference"
            value={enquiry.projectReference}
          />
          <ReadField label="Project status">
            <ProjectStatusPill status={enquiry.projectStatus} />
          </ReadField>
          <ReadField label="Current status">
            <StatusBadge status={enquiry.currentStatus} />
          </ReadField>
          <ReadField
            label="Registered"
            value={formatDateTime(enquiry.createdAt)}
          />
        </div>
      </section>

      {/* projects + scope */}
      <section className={CARD}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Project information
          </p>
          <p className="text-xs text-ink-400">
            {projects.length} project{projects.length === 1 ? "" : "s"} ·{" "}
            {activityCount} activit{activityCount === 1 ? "y" : "ies"}
          </p>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-ink-400">No projects recorded.</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project, i) => (
              <div
                key={project.id ?? i}
                className="rounded-xl bg-ink-50 p-4 dark:bg-ink-800/60"
              >
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-ink-900 dark:text-ink-50">
                    <span className="mr-2 text-xs font-semibold text-ink-400">
                      #{i + 1}
                    </span>
                    {project.projectName || "Untitled project"}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
                    <MapPin className="h-3.5 w-3.5" />
                    {[project.emirate, project.country]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </div>
                <div className="overflow-x-auto rounded-lg bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
                  <table className="w-full min-w-140 text-left text-sm">
                    <thead>
                      <tr className="border-b border-ink-100 text-xs text-ink-400 dark:border-ink-800">
                        <th className="w-12 px-3 py-2 font-medium">#</th>
                        <th className="px-3 py-2 font-medium">Activity</th>
                        <th className="px-3 py-2 font-medium">Unit</th>
                        <th className="px-3 py-2 text-right font-medium">
                          Quantity
                        </th>
                        <th className="px-3 py-2 font-medium">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(project.scopeOfServices ?? []).map((scope, j) => (
                        <tr
                          key={scope.id ?? j}
                          className="border-b border-ink-50 last:border-0 dark:border-ink-800"
                        >
                          <td className="px-3 py-2 text-ink-400">{j + 1}</td>
                          <td className="px-3 py-2 font-medium text-ink-900 dark:text-ink-50">
                            {scope.activityName ||
                              `Activity #${scope.activityId}`}
                          </td>
                          <td className="px-3 py-2 text-ink-600 dark:text-ink-300">
                            {scope.unit}
                          </td>
                          <td className="px-3 py-2 text-right tabular text-ink-600 dark:text-ink-300">
                            {scope.quantity}
                          </td>
                          <td className="px-3 py-2 text-ink-500">
                            {scope.remarks || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* site visit */}
      <section className={CARD}>
        <p className={TITLE}>Site visit information</p>
        {sv?.siteVisitRequired ? (
          <div className={GRID}>
            <ReadField label="Site visit" value="Required" />
            <ReadField
              label="Gate pass"
              value={sv.gatePassRequired ? "Required" : "Not required"}
            />
            <ReadField label="Assigned to" value={sv.siteVisitAssignedTo} />
            <ReadField
              label="Date & time"
              value={sv.siteVisitDate ? formatDateTime(sv.siteVisitDate) : ""}
            />
            <ReadField label="Contact person" value={sv.contactPerson} />
            <ReadField label="Contact number">
              {sv.contactNumber ? (
                <a href={`tel:${sv.contactNumber}`} className={LINK}>
                  <Phone className="h-3.5 w-3.5" />
                  {sv.contactNumber}
                </a>
              ) : (
                "—"
              )}
            </ReadField>
            <ReadField label="Location">
              {sv.googleMapLink ? (
                <a
                  href={sv.googleMapLink}
                  target="_blank"
                  rel="noreferrer"
                  className={LINK}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open in Maps
                </a>
              ) : (
                "—"
              )}
            </ReadField>
          </div>
        ) : (
          <p className="text-sm text-ink-400">Not required.</p>
        )}
      </section>

      {/* attachments */}
      <section className={CARD}>
        <p className={TITLE}>Attachments ({files.length})</p>
        <AttachmentList
          attachments={files}
          emptyText="No files were uploaded with this enquiry."
        />
      </section>

      {/* remarks */}
      <section className={CARD}>
        <p className={TITLE}>Remarks</p>
        <p className="whitespace-pre-line text-sm text-ink-700 dark:text-ink-300">
          {enquiry.remarks || "—"}
        </p>
      </section>

      {closure && (
        <section className="rounded-xl bg-ink-50 p-5 ring-1 ring-ink-100 dark:bg-ink-800 dark:ring-ink-700">
          <p className={TITLE}>Closure remarks</p>
          <p className="text-sm text-ink-700 dark:text-ink-300">{closure}</p>
        </section>
      )}

      {/* actions */}
      <section className={CARD}>
        <p className={TITLE}>Choose your action</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={pendingAction}
            onChange={(e) => setPendingAction(e.target.value)}
            className="sm:w-72"
          >
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
        onClose={closeModal}
        onSubmit={handleSiteVisitSubmit}
      />
      <OutsourceRequestModal
        open={action === "OUTSOURCE"}
        enquiry={enquiry}
        onClose={closeModal}
        onSubmit={handleOutsourceSubmit}
      />
      <CloseEnquiryModal
        open={action === "CLOSE"}
        enquiry={enquiry}
        onClose={closeModal}
        onSubmit={(remarks) => {
          setClosure(remarks);
          closeModal();
        }}
      />
    </div>
  );
}
