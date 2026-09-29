import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEnquiries } from "../hooks/useEnquiries";
import { EnquiryToolbar } from "../components/EnquiryToolbar";
import { EnquiryFilters } from "../components/EnquiryFilters";
import { EnquiryTable } from "../components/EnquiryTable";
import { ConnectionBanner } from "../../../shared/components/feedback/ConnectionBanner";
import { ConfirmDialog } from "../../../shared/components/feedback/ConfirmDialog";
import { EmptyState } from "../../../shared/components/feedback/EmptyState";
import { Pagination } from "../../../shared/components/tables/Pagination";
import { Loader } from "../../../shared/components/feedback/Loader";
import { useDebounce } from "../../../shared/hooks/useDebounce";

export default function EnquiryListPage() {
  const navigate = useNavigate();
  const { enquiries, loading, connected, page, totalPages, goToPage, refresh, deleteEnquiry } = useEnquiries();

  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTasks, setActiveTasks] = useState(["pending"]);
  const [pendingDelete, setPendingDelete] = useState(null);
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

  return (
    <div className="space-y-4">
      <ConnectionBanner connected={connected} onRetry={refresh} />

      <EnquiryToolbar
        query={query}
        onQueryChange={setQuery}
        onNew={() => navigate("/enquiries/new")}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        filtersOpen={filtersOpen}
        activeFilterCount={activeTasks.includes("viewAll") ? 0 : activeTasks.length}
      />

      <div className="flex items-start gap-4">
        {filtersOpen && (
          <EnquiryFilters
            activeTasks={activeTasks}
            onApply={(tasks) => {
              setActiveTasks(tasks);
              setFiltersOpen(false);
            }}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        <div className="flex-1 space-y-4">
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
                onDelete={setPendingDelete}
              />
              <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this enquiry?"
        description={pendingDelete ? `${pendingDelete.enquiryNo} · ${pendingDelete.customerName} will be permanently removed.` : ""}
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          await deleteEnquiry(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
