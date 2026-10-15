import { Link, useNavigate } from "react-router-dom";
import { Eye, MessageSquarePlus, Pencil } from "lucide-react";
import { formatCurrency, formatDate } from "../../../../shared/utils";
import { daysLeft, validUntil } from "../schemas/quotation.schema";
import { QuotationStatusBadge } from "./QuotationStatusBadge";

const STICKY =
  "sticky right-0 bg-white shadow-[-8px_0_12px_-10px_rgba(10,10,10,0.25)] dark:bg-ink-900";

function ValidUntil({ q }) {
  const date = validUntil(q.quotationDate, q.quotationValidity);
  if (!date) return <span className="text-ink-400">—</span>;
  const left = daysLeft(date);
  const tone =
    left < 0
      ? "text-signal-600 dark:text-signal-400"
      : left <= 3
        ? "text-amber-600 dark:text-amber-400"
        : "text-ink-500";
  return (
    <span className={tone}>
      {formatDate(date)}
      {left < 0 && <span className="block text-[11px]">Expired</span>}
    </span>
  );
}

/**
 * Quotation rows (GET /api/quotation shape). mode "followup" swaps the edit
 * action for a Follow-ups shortcut.
 */
export function QuotationTable({ quotations, mode = "quotation" }) {
  const navigate = useNavigate();
  const columns = [
    "Quotation",
    "Status",
    "Date",
    "Valid until",
    "Enquiry",
    "Customer / Project",
    "Total",
    "",
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs text-ink-400 dark:border-ink-800">
              {columns.map((c, i) => (
                <th
                  key={c || i}
                  className={
                    i === columns.length - 1
                      ? `${STICKY} px-3 py-3 font-medium`
                      : `whitespace-nowrap px-4 py-3 font-medium ${c === "Total" ? "text-right" : ""}`
                  }
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr
                key={q.id}
                onClick={() => navigate(`/quotations/${q.id}`)}
                className="group cursor-pointer border-b border-ink-50 last:border-0 hover:bg-ink-50/60 dark:border-ink-800 dark:hover:bg-ink-800/60"
              >
                <td className="px-4 py-3.5">
                  <p className="whitespace-nowrap font-mono text-xs font-semibold text-ink-900 dark:text-ink-50">
                    {q.quotationNo ?? `#${q.id}`}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <QuotationStatusBadge status={q.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-ink-500">
                  {formatDate(q.quotationDate)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm">
                  <ValidUntil q={q} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <Link
                    to={`/enquiries/${q.enquiryId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-mono text-xs text-ink-600 hover:text-signal-600 dark:text-ink-300"
                  >
                    {q.enquiryNo ?? `#${q.enquiryId}`}
                  </Link>
                </td>
                <td className="max-w-[300px] px-4 py-3.5">
                  <p className="truncate font-medium text-ink-900 dark:text-ink-50">
                    {q.customerName}
                  </p>
                  <p className="truncate text-xs text-ink-400">
                    {q.projectName}
                    {q.attentionTo ? ` · Attn ${q.attentionTo}` : ""}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium tabular text-ink-900 dark:text-ink-50">
                  {formatCurrency(q.total, q.currency || "AED")}
                </td>
                <td
                  className={`${STICKY} px-3 py-3.5 group-hover:bg-ink-50 dark:group-hover:bg-ink-800`}
                >
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => navigate(`/quotations/${q.id}`)}
                      className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
                      title="View"
                      aria-label={`View ${q.quotationNo}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {mode === "followup" ? (
                      <button
                        onClick={() => navigate(`/quotations/${q.id}#follow-ups`)}
                        className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
                        title="Follow-ups"
                        aria-label={`Follow-ups for ${q.quotationNo}`}
                      >
                        <MessageSquarePlus className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/quotations/${q.id}/edit`)}
                        className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
                        title="Edit"
                        aria-label={`Edit ${q.quotationNo}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
