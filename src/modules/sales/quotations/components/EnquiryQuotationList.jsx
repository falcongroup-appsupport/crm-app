import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";
import { Tabs } from "../../../../shared/components/ui/Tabs";
import { Loader } from "../../../../shared/components/feedback/Loader";
import { EmptyState } from "../../../../shared/components/feedback/EmptyState";
import { ConnectionBanner } from "../../../../shared/components/feedback/ConnectionBanner";
import { Pagination } from "../../../../shared/components/tables/Pagination";
import { formatDate } from "../../../../shared/utils";
import { useEnquiries } from "../../../enquiries/hooks/useEnquiries";
import { StatusBadge } from "../../../enquiries/components/StatusBadge";

// Quotations are reached through their enquiry (the API has no "list all"),
// so both the quotation and follow-up screens are views over the enquiry list.
const ISSUED = ["QUOTATION_DELIVERED", "SALES_ORDER_CREATED"];
const FOLLOW_UP = ["QUOTATION_DELIVERED", "UNDER_CLARIFICATIONS"];

const MODES = {
  quotation: {
    tabs: [
      { key: "pending", label: "Pending quotation" },
      { key: "issued", label: "Quotations issued" },
    ],
    filter: (tab, e) =>
      tab === "issued"
        ? ISSUED.includes(e.currentStatus)
        : !ISSUED.includes(e.currentStatus),
    action: (tab) =>
      tab === "issued" ? "View quotation" : "Create / open quotation",
    target: (e) => `/enquiries/${e.id}/quotation`,
    empty: "No enquiries here yet.",
  },
  followup: {
    tabs: null,
    filter: (_, e) => FOLLOW_UP.includes(e.currentStatus),
    action: () => "Follow-ups",
    target: (e) => `/enquiries/${e.id}/quotation#follow-ups`,
    empty: "No delivered quotations to follow up on yet.",
  },
};

export function EnquiryQuotationList({ mode }) {
  const cfg = MODES[mode];
  const navigate = useNavigate();
  const { enquiries, loading, connected, page, totalPages, goToPage, refresh } =
    useEnquiries();
  const [tab, setTab] = useState(cfg.tabs?.[0].key ?? "all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enquiries
      .filter((e) => cfg.filter(tab, e))
      .filter(
        (e) =>
          !q ||
          `${e.enquiryNo} ${e.companyName} ${e.contactPerson ?? e.customerName ?? ""}`
            .toLowerCase()
            .includes(q),
      );
  }, [enquiries, cfg, tab, query]);

  return (
    <div className="space-y-4">
      <ConnectionBanner connected={connected} onRetry={refresh} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {cfg.tabs && (
          <div className="sm:w-96">
            <Tabs tabs={cfg.tabs} active={tab} onChange={setTab} />
          </div>
        )}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by enquiry number, company or contact person…"
            className="h-9 w-full rounded-lg bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 ring-1 ring-inset ring-ink-100 focus:ring-2 focus:ring-signal-500 dark:bg-ink-800 dark:text-ink-50 dark:ring-ink-700 dark:placeholder:text-ink-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
          <Loader label="Loading enquiries…" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title={cfg.empty}
          description="Enquiries appear here as their status moves through the quotation stages."
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs text-ink-400 dark:border-ink-800">
                  {[
                    "Enquiry No.",
                    "Company",
                    "Contact person",
                    "Date of Enquiry",
                    "Status",
                    "Submission Deadline",
                    "",
                  ].map((c) => (
                    <th
                      key={c}
                      className="whitespace-nowrap px-5 py-3 font-medium"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60 dark:border-ink-800 dark:hover:bg-ink-800/60"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs font-medium text-ink-900 dark:text-ink-50">
                      {e.enquiryNo}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-ink-50">
                      {e.companyName}
                    </td>
                    <td className="px-5 py-3.5 text-ink-600 dark:text-ink-300">
                      {e.contactPerson || e.customerName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-ink-500">
                      {formatDate(e.dateOfEnquiry)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={e.currentStatus} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-ink-400">
                      {e.submissionDeadline
                        ? formatDate(e.submissionDeadline)
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(cfg.target(e))}
                      >
                        {cfg.action(tab)}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
    </div>
  );
}
