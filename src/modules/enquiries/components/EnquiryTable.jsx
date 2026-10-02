import { motion } from "framer-motion";
import { Eye, Pencil } from "lucide-react";
import { ProjectStatusPill } from "./StatusBadge";
import { StatusMenu } from "./StatusMenu";
import { formatDate, initials } from "../../../shared/utils";

// Matches the fields the list endpoint (GET /api/enquiry) actually returns —
// it's a summary projection, not the full record, so there's no scope/project
// detail to show here. Open the row for that.
const columns = [
  "Enquiry No.",
  "Current Status",
  "Enquiry Date",
  "Project Status",
  "Lead",
  "Company / Contact",
  "Project Name",
  "Deadline",
  "",
];

function projectSummary(enquiry) {
  const projects = (enquiry.projectInformations ?? []).filter(
    (p) => p.projectName,
  );
  const activities = [
    ...new Set(
      projects
        .flatMap((p) => (p.scopeOfServices ?? []).map((s) => s.activityName))
        .filter(Boolean),
    ),
  ];
  return {
    first: projects[0]?.projectName ?? null,
    more: Math.max(projects.length - 1, 0),
    allNames: projects.map((p) => p.projectName).join("\n"),
    activities:
      activities.length > 2
        ? `${activities.slice(0, 2).join(", ")} +${activities.length - 2}`
        : activities.join(", "),
  };
}

export function EnquiryTable({
  enquiries,
  onRowClick,
  onEdit,
  onStatusChange,
  updatingId,
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-260 text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs text-ink-400 dark:border-ink-800">
              {columns.map((col, i) => (
                <th
                  key={col || i}
                  className={
                    i === columns.length - 1
                      ? "sticky right-0 bg-white px-4 py-3 font-medium shadow-[-8px_0_12px_-10px_rgba(10,10,10,0.25)] dark:bg-ink-900"
                      : "whitespace-nowrap px-4 py-3 font-medium"
                  }
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry, i) => (
              <motion.tr
                key={enquiry.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.03 }}
                className="group cursor-pointer border-b border-ink-50 last:border-0 hover:bg-ink-50/60 dark:border-ink-800 dark:hover:bg-ink-800/60"
                onClick={() => onRowClick(enquiry)}
              >
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-medium text-ink-900 dark:text-ink-50">
                  {enquiry.enquiryNo}
                </td>
                <td className="px-4 py-3.5">
                  <StatusMenu
                    status={enquiry.currentStatus}
                    busy={updatingId === enquiry.id}
                    onChange={(status) => onStatusChange(enquiry, status)}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-ink-500">
                  {formatDate(enquiry.dateOfEnquiry)}
                </td>
                <td className="px-4 py-3.5">
                  <ProjectStatusPill status={enquiry.projectStatus} />
                </td>
                <td className="px-4 py-3.5">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-100 text-[10px] font-semibold text-ink-600 dark:bg-ink-700 dark:text-ink-200"
                    title={
                      !enquiry.projectLead || enquiry.projectLead === "NO_LEAD"
                        ? "No lead"
                        : enquiry.projectLead
                    }
                  >
                    {!enquiry.projectLead || enquiry.projectLead === "NO_LEAD"
                      ? "—"
                      : initials(enquiry.projectLead)}
                  </div>
                </td>
                <td className="max-w-55 px-4 py-3.5">
                  <p className="truncate font-medium text-ink-900 dark:text-ink-50">
                    {enquiry.companyName}
                  </p>
                  <p className="truncate text-xs text-ink-400">
                    {enquiry.contactPerson || enquiry.customerName}
                  </p>
                </td>
                <td className="max-w-70 px-4 py-3.5">
                  {(() => {
                    const p = projectSummary(enquiry);
                    if (!p.first)
                      return <span className="text-ink-400">—</span>;
                    return (
                      <div className="min-w-0" title={p.allNames}>
                        <p className="truncate font-medium text-ink-800 dark:text-ink-100">
                          {p.first}
                          {p.more > 0 && (
                            <span className="ml-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500 dark:bg-ink-800 dark:text-ink-300">
                              +{p.more}
                            </span>
                          )}
                        </p>
                        {p.activities && (
                          <p className="truncate text-xs text-ink-400">
                            {p.activities}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-ink-400">
                  {enquiry.submissionDeadline
                    ? formatDate(enquiry.submissionDeadline)
                    : "—"}
                </td>
                <td className="sticky right-0 bg-white px-3 py-3.5 shadow-[-8px_0_12px_-10px_rgba(10,10,10,0.25)] group-hover:bg-ink-50 dark:bg-ink-900 dark:group-hover:bg-ink-800">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(enquiry);
                      }}
                      className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
                      aria-label={`View ${enquiry.enquiryNo}`}
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(enquiry);
                      }}
                      className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
                      aria-label={`Edit ${enquiry.enquiryNo}`}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
