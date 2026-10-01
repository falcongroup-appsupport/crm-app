import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEnquiries } from "../hooks/useEnquiries";
import { EnquiryToolbar } from "../components/EnquiryToolbar";
import { EnquiryFilters } from "../components/EnquiryFilters";
import { EnquiryTable } from "../components/EnquiryTable";
import { ConnectionBanner } from "../../../shared/components/feedback/ConnectionBanner";
import { EmptyState } from "../../../shared/components/feedback/EmptyState";
import { Pagination } from "../../../shared/components/tables/Pagination";
import { Loader } from "../../../shared/components/feedback/Loader";
import { useDebounce } from "../../../shared/hooks/useDebounce";

export default function EnquiryListPage() {
  const navigate = useNavigate();
  const { enquiries, loading, connected, page, totalPages, goToPage, refresh, changeStatus } = useEnquiries();

  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTasks, setActiveTasks] = useState(["pending"]);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const debouncedQuery = useDebounce(query, 250);

  const filtered = useMemo(() => {
    let list = enquiries.filter((e) => !e.closedLocally);

    if (activeTasks.length && !activeTasks.includes("viewAll")) {
      list = list.filter((e) => {
        return activeTasks.some((task) => {
          switch (task) {
            case "pending":
              return !["QUOTATION_DELIVERED", "SALES_ORDER_CREATED"].includes(e.currentStatus);
            case "underEstimation":
              return e.currentStatus === "UNDER_ESTIMATION";
            case "underApproval":
              return e.currentStatus === "UNDER_APPROVAL_INTERNAL";
            case "deliveredQuotation":
              return e.currentStatus === "QUOTATION_DELIVERED";
            case "tenders":
              return e.projectStatus === "TENDER";
            case "salesOrderCreated":
              return e.currentStatus === "SALES_ORDER_CREATED";
            case "deadline":
              return Boolean(e.submissionDeadline);
            default:
              return true;
          }
        });
      });
    }

    const q = debouncedQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((e) => `${e.enquiryNo} ${e.customerName} ${e.companyName}`.toLowerCase().includes(q));
    }

    return list;
  }, [enquiries, activeTasks, debouncedQuery]);

  const handleStatusChange = async (enquiry, status) => {
    setStatusError(null);
    setUpdatingId(enquiry.id);
    try {
      await changeStatus(enquiry.id, status);
    } catch (err) {
      setStatusError(err?.message || "Could not update the status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <ConnectionBanner connected={connected} onRetry={refresh} />

      <EnquiryToolbar
        query={query}
        onQueryChange={setQuery}
        onNew={() => navigate("/enquiries/new")}
        onToggleFilters={() => setFiltersOpen(true)}
        filtersOpen={filtersOpen}
        activeFilterCount={activeTasks.includes("viewAll") ? 0 : activeTasks.length}
      />

      {statusError && (
        <p className="rounded-lg bg-signal-50 px-4 py-2.5 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
          {statusError}
        </p>
      )}

      {loading ? (
        <div className="rounded-xl bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
          <Loader label="Loading enquiries…" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No enquiries match those filters"
          description="Try View All, clear the search, or register a new enquiry."
          actionLabel="Add enquiry"
          onAction={() => navigate("/enquiries/new")}
        />
      ) : (
        <>
          <EnquiryTable
            enquiries={filtered}
            onRowClick={(e) => navigate(`/enquiries/${e.id}`)}
            onEdit={(e) => navigate(`/enquiries/${e.id}/edit`)}
            onStatusChange={handleStatusChange}
            updatingId={updatingId}
          />
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </>
      )}

      <EnquiryFilters
        open={filtersOpen}
        activeTasks={activeTasks}
        onApply={(tasks) => {
          setActiveTasks(tasks);
          setFiltersOpen(false);
        }}
        onClose={() => setFiltersOpen(false)}
      />
    </div>
  );
}
