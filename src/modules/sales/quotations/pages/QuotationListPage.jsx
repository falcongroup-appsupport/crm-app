import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FilePlus2 } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";
import { Tabs } from "../../../../shared/components/ui/Tabs";
import { Loader } from "../../../../shared/components/feedback/Loader";
import { EmptyState } from "../../../../shared/components/feedback/EmptyState";
import { Pagination } from "../../../../shared/components/tables/Pagination";
import { ErrorToast } from "../../../../shared/components/feedback/toast/ErrorToast";
import { ConnectionBanner } from "../../../../shared/components/feedback/ConnectionBanner";
import { formatDate } from "../../../../shared/utils";
import { useEnquiries } from "../../../enquiries/hooks/useEnquiries";
import { StatusBadge } from "../../../enquiries/components/StatusBadge";
import { useQuotations } from "../hooks/useQuotations";
import { QuotationBrowser } from "../components/QuotationBrowser";

/**
 * Sales → Quotations.
 *  - "Quotations": every quotation (GET /api/quotation).
 *  - "Awaiting quotation": enquiries on the loaded page with no quotation yet.
 */
export default function QuotationListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "awaiting" ? "awaiting" : "quotations";
  const { quotations, loading, error, refresh } = useQuotations();
  const enq = useEnquiries();

  const quotedEnquiryIds = useMemo(
    () => new Set(quotations.map((q) => String(q.enquiryId))),
    [quotations],
  );
  const awaiting = useMemo(
    () =>
      enq.enquiries.filter(
        (e) =>
          !quotedEnquiryIds.has(String(e.id)) &&
          e.currentStatus !== "SALES_ORDER_CREATED",
      ),
    [enq.enquiries, quotedEnquiryIds],
  );

  const setTab = (key) =>
    setParams(key === "awaiting" ? { tab: "awaiting" } : {}, { replace: true });

  return (
    <div className="space-y-4">
      <ErrorToast error={error} title="Couldn't load quotations" onRetry={refresh} />
      <ConnectionBanner connected={enq.connected} onRetry={enq.refresh} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-950 dark:text-white">
            Sales quotations
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            Quotations issued to customers, and enquiries still waiting for one.
          </p>
        </div>
        <Button onClick={() => setTab("awaiting")}>
          <FilePlus2 className="h-4 w-4" />
          New quotation
        </Button>
      </div>

      <div className="sm:w-[26rem]">
        <Tabs
          tabs={[
            {
              key: "quotations",
              label: `Quotations${loading ? "" : ` (${quotations.length})`}`,
            },
            {
              key: "awaiting",
              label: `Awaiting quotation${enq.loading || loading ? "" : ` (${awaiting.length})`}`,
            },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === "quotations" ? (
        <QuotationBrowser
          quotations={quotations}
          loading={loading}
          emptyText="Create one from an enquiry in the “Awaiting quotation” tab."
        />
      ) : enq.loading || loading ? (
        <div className="rounded-xl bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
          <Loader label="Loading enquiries…" />
        </div>
      ) : awaiting.length === 0 ? (
        <EmptyState
          title="Every enquiry on this page has a quotation"
          description="Enquiries without a quotation show up here."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-xs text-ink-400 dark:border-ink-800">
                    {[
                      "Enquiry No.",
                      "Company / Contact",
                      "Projects",
                      "Status",
                      "Deadline",
                      "",
                    ].map((c) => (
                      <th key={c} className="whitespace-nowrap px-4 py-3 font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {awaiting.map((e) => (
                    <tr
                      key={e.id}
                      className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60 dark:border-ink-800 dark:hover:bg-ink-800/60"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-medium text-ink-900 dark:text-ink-50">
                        {e.enquiryNo}
                      </td>
                      <td className="max-w-[240px] px-4 py-3.5">
                        <p className="truncate font-medium text-ink-900 dark:text-ink-50">
                          {e.companyName}
                        </p>
                        <p className="truncate text-xs text-ink-400">
                          {e.contactPerson || e.customerName}
                        </p>
                      </td>
                      <td className="max-w-[280px] truncate px-4 py-3.5 text-ink-600 dark:text-ink-300">
                        {(e.projectInformations ?? [])
                          .map((p) => p.projectName)
                          .join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={e.currentStatus} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-ink-500">
                        {e.submissionDeadline ? formatDate(e.submissionDeadline) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/quotations/new?enquiryId=${e.id}`)}
                        >
                          <FilePlus2 className="h-4 w-4" />
                          Create quotation
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            page={enq.page}
            totalPages={enq.totalPages}
            onChange={enq.goToPage}
          />
        </>
      )}
    </div>
  );
}
