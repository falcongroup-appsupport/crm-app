import { ArrowLeftRight, MapPin } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { ReadField } from "../../../shared/components/ui/ReadField";
import { formatDate } from "../../../shared/utils";
import { StatusBadge, ProjectStatusPill } from "./StatusBadge";

const GRID =
  "grid grid-cols-[repeat(auto-fill,minmax(max(14rem,calc((100%_-_3rem)/4)),1fr))] gap-x-4 gap-y-4";

/** Read-only card for the enquiry new projects are being added to. */
export function ExistingEnquirySummary({ enquiry, onChange }) {
  const projects = enquiry.projectInformations ?? [];
  return (
    <section className="rounded-xl bg-white p-5 ring-2 ring-signal-500/40 dark:bg-ink-900">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Adding to existing enquiry
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-semibold text-ink-950 dark:text-white">
              {enquiry.enquiryNo}
            </span>
            <StatusBadge status={enquiry.currentStatus} />
            <ProjectStatusPill status={enquiry.projectStatus} />
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={onChange}>
          <ArrowLeftRight className="h-4 w-4" />
          Change enquiry
        </Button>
      </div>

      <div className={GRID}>
        <ReadField label="Company name" value={enquiry.companyName} />
        <ReadField
          label="Customer / Client name"
          value={enquiry.customerName}
        />
        <ReadField label="Contact person" value={enquiry.contactPerson} />
        <ReadField label="Contact number" value={enquiry.contactNumber} />
        <ReadField label="Email" value={enquiry.customerEmail} />
        <ReadField
          label="Enquiry date"
          value={formatDate(enquiry.dateOfEnquiry)}
        />
        <ReadField
          label="Submission deadline"
          value={
            enquiry.submissionDeadline
              ? formatDate(enquiry.submissionDeadline)
              : ""
          }
        />
        <ReadField
          label="Enquiry lead"
          value={
            !enquiry.projectLead || enquiry.projectLead === "NO_LEAD"
              ? "No lead"
              : enquiry.projectLead
          }
        />
      </div>

      <div className="mt-5 border-t border-ink-100 pt-4 dark:border-ink-800">
        <p className="mb-2 text-xs font-medium text-ink-400">
          Existing projects ({projects.length}) — these stay as they are
        </p>
        {projects.length === 0 ? (
          <p className="text-sm text-ink-400">None yet.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((p, i) => (
              <li
                key={p.id ?? i}
                className="rounded-lg bg-ink-50 px-3 py-2.5 dark:bg-ink-800/60"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-ink-900 dark:text-ink-50">
                    {p.projectName}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-ink-400">
                    <MapPin className="h-3 w-3" />
                    {[p.emirate, p.country].filter(Boolean).join(", ")}
                  </p>
                </div>
                {(p.scopeOfServices ?? []).length > 0 && (
                  <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                    {p.scopeOfServices
                      .map((s) => `${s.activityName} (${s.quantity} ${s.unit})`)
                      .join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
