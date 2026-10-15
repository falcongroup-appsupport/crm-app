import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Select } from "../../../../shared/components/forms";
import { Pagination } from "../../../../shared/components/tables/Pagination";
import { Loader } from "../../../../shared/components/feedback/Loader";
import { EmptyState } from "../../../../shared/components/feedback/EmptyState";
import { quotationStatusLabel } from "../constants/quotationConstants";
import { QuotationTable } from "./QuotationTable";

const PAGE_SIZE = 15;

/** Search + status filter + client-side paging over an already-loaded quotation list. */
export function QuotationBrowser({
  quotations,
  loading,
  mode = "quotation",
  emptyTitle = "No quotations yet",
  emptyText,
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);

  const statuses = useMemo(
    () => [...new Set(quotations.map((q) => q.status).filter(Boolean))],
    [quotations],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotations.filter((x) => {
      if (status && x.status !== status) return false;
      if (!q) return true;
      return [
        x.quotationNo,
        x.quotationReference,
        x.enquiryNo,
        x.customerName,
        x.projectName,
        x.attentionTo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [quotations, query, status]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages - 1);
  const pageRows = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search by quotation no., reference, enquiry, customer or project…"
            className="h-9 w-full rounded-lg bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 ring-1 ring-inset ring-ink-100 focus:ring-2 focus:ring-signal-500 dark:bg-ink-800 dark:text-ink-50 dark:ring-ink-700 dark:placeholder:text-ink-500"
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="!py-2"
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {quotationStatusLabel(s)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
          <Loader label="Loading quotations…" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title={quotations.length ? "No quotations match" : emptyTitle}
          description={
            quotations.length ? "Try a different search or status." : emptyText
          }
        />
      ) : (
        <>
          <QuotationTable quotations={pageRows} mode={mode} />
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-400">
              {rows.length} quotation{rows.length === 1 ? "" : "s"}
            </p>
            <Pagination page={current} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
