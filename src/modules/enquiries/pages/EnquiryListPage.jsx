import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEnquiries } from "../hooks/useEnquiries";
import { EnquiryToolbar } from "../components/EnquiryToolbar";
import { EnquiryFilters } from "../components/EnquiryFilters";
import { EnquiryTable } from "../components/EnquiryTable";
import { ConnectionBanner } from "../../../shared/components/feedback/ConnectionBanner";
import { EmptyState } from "../../../shared/components/feedback/EmptyState";
import { Pagination } from "../../../shared/components/tables/Pagination";
import { ConfirmDialog } from "../../../shared/components/feedback/ConfirmDialog";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../../../shared/components/feedback/toast/useToast";
import { STATUS_LABEL } from "../constants/enquiryStatus";
import { Loader } from "../../../shared/components/feedback/Loader";
import { useDebounce } from "../../../shared/hooks/useDebounce";

export default function EnquiryListPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const {
    enquiries,
    loading,
    connected,
    page,
    totalPages,
    goToPage,
    refresh,
    changeStatus,
  } = useEnquiries();

  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTasks, setActiveTasks] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const debouncedQuery = useDebounce(query, 250);

  const filtered = useMemo(() => {
    let list = enquiries.filter((e) => !e.closedLocally);

    if (activeTasks.length && !activeTasks.includes("viewAll")) {
      list = list.filter((e) => {
        return activeTasks.some((task) => {
          switch (task) {
            case "pending":
              return !["QUOTATION_DELIVERED", "SALES_ORDER_CREATED"].includes(
                e.currentStatus,
              );
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
      list = list.filter((e) =>
        [
          e.enquiryNo,
          e.companyName,
          e.contactPerson,
          e.customerName,
          ...(e.projectInformations ?? []).map((p) => p.projectName),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    return list;
  }, [enquiries, activeTasks, debouncedQuery]);

  // Picking a status opens a confirmation first; nothing is saved until confirmed.
  const [pendingStatus, setPendingStatus] = useState(null); // { enquiry, status }

  const confirmStatusChange = async () => {
    const { enquiry, status } = pendingStatus;
    setUpdatingId(enquiry.id);
    try {
      await changeStatus(enquiry.id, status);
      setPendingStatus(null);
      toast.success("Status updated", {
        description: `${enquiry.enquiryNo} is now ${STATUS_LABEL[status] ?? status}`,
      });
    } catch (err) {
      setPendingStatus(null);
      toast.error("Couldn't update the status", {
        description: `${enquiry.enquiryNo}: ${err?.message || "request failed"}`,
      });
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
        activeFilterCount={
          activeTasks.includes("viewAll") ? 0 : activeTasks.length
        }
      />

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
            onStatusChange={(enquiry, status) =>
              setPendingStatus({ enquiry, status })
            }
            updatingId={updatingId}
          />
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        tone="primary"
        title="Change enquiry status?"
        confirmLabel="Change status"
        busy={
          Boolean(pendingStatus) && updatingId === pendingStatus?.enquiry.id
        }
        description={
          pendingStatus && (
            <div className="space-y-3">
              <p>
                <span className="font-mono font-medium text-ink-800 dark:text-ink-100">
                  {pendingStatus.enquiry.enquiryNo}
                </span>{" "}
                · {pendingStatus.enquiry.companyName}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={pendingStatus.enquiry.currentStatus} />
                <span aria-hidden="true">→</span>
                <StatusBadge status={pendingStatus.status} />
              </div>
            </div>
          )
        }
        onConfirm={confirmStatusChange}
        onCancel={() => setPendingStatus(null)}
      />

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
