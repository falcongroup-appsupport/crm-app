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
  "Date of Enquiry",
  "Project Status",
  "Lead",
  "Customer / Client",
  "Company",
  "Submission Deadline",
  "",
];

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
        <table className="w-full min-w-245 text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs text-ink-400 dark:border-ink-800">
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-5 py-3 font-medium"
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
                <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs font-medium text-ink-900 dark:text-ink-50">
                  {enquiry.enquiryNo}
                </td>
                <td className="px-5 py-3.5">
                  <StatusMenu
                    status={enquiry.currentStatus}
                    busy={updatingId === enquiry.id}
                    onChange={(status) => onStatusChange(enquiry, status)}
                  />
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-ink-500">
                  {formatDate(enquiry.dateOfEnquiry)}
                </td>
                <td className="px-5 py-3.5">
                  <ProjectStatusPill status={enquiry.projectStatus} />
                </td>
                <td className="px-5 py-3.5">
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
                <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-ink-50">
                  {enquiry.customerName}
                </td>
                <td className="max-w-50 truncate px-5 py-3.5 text-ink-600 dark:text-ink-300">
                  {enquiry.companyName}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-ink-400">
                  {enquiry.submissionDeadline
                    ? formatDate(enquiry.submissionDeadline)
                    : "—"}
                </td>
                <td className="px-5 py-3.5">
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
