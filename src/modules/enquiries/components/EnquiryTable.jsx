import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { StatusBadge, ProjectStatusPill } from "./StatusBadge";
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
  "Customer",
  "Company",
  "Submission Deadline",
  "",
];

export function EnquiryTable({ enquiries, onRowClick, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs text-ink-400 dark:border-ink-800">
              {columns.map((col) => (
                <th key={col} className="whitespace-nowrap px-5 py-3 font-medium">
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
                  <StatusBadge status={enquiry.currentStatus} />
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-ink-500">{formatDate(enquiry.dateOfEnquiry)}</td>
                <td className="px-5 py-3.5">
                  <ProjectStatusPill status={enquiry.projectStatus} />
                </td>
                <td className="px-5 py-3.5">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-100 text-[10px] font-semibold text-ink-600 dark:bg-ink-700 dark:text-ink-200"
                    title={enquiry.projectLead || "No lead"}
                  >
                    {initials(enquiry.projectLead || "No Lead")}
                  </div>
                </td>
                <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-ink-50">{enquiry.customerName}</td>
                <td className="max-w-[200px] truncate px-5 py-3.5 text-ink-600 dark:text-ink-300">{enquiry.companyName}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-ink-400">
                  {enquiry.submissionDeadline ? formatDate(enquiry.submissionDeadline) : "—"}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(enquiry);
                      }}
                      className="rounded-md p-1.5 text-ink-400 hover:bg-white hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
                      aria-label={`Edit ${enquiry.enquiryNo}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(enquiry);
                      }}
                      className="rounded-md p-1.5 text-ink-400 hover:bg-signal-50 hover:text-signal-600 dark:hover:bg-signal-500/10"
                      aria-label={`Delete ${enquiry.enquiryNo}`}
                    >
                      <Trash2 className="h-4 w-4" />
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
