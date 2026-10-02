import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { useInternalRequests } from "../hooks/useInternalRequests";
import { Button } from "../../../../shared/components/ui/Button";
import { TaskFilterDrawer } from "../../../../shared/components/ui/TaskFilterDrawer";
import { EmptyState } from "../../../../shared/components/feedback/EmptyState";
import { formatDateTime, initials } from "../../../../shared/utils";
import { INTERNAL_REQUEST_FILTER_TASKS } from "../constants/requestStatus";

const TYPE_LABEL = {
  SITE_VISIT: "Site Visit",
  SITE_VISIT_WITH_PERMIT: "Site Visit (Permit)",
  OUTSOURCE_REQUEST: "Outsource Request",
};

const STATUS_STYLE = {
  OPEN: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30",
  CLOSED:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
  CANCELLED:
    "bg-ink-100 text-ink-500 ring-1 ring-inset ring-ink-200 dark:bg-ink-700 dark:text-ink-400 dark:ring-ink-600",
};

export default function InternalRequestsPage() {
  const navigate = useNavigate();
  const { requests } = useInternalRequests();
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState(["open"]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = requests;
    if (!tasks.includes("viewAll")) {
      list = list.filter((r) => {
        if (tasks.includes("open") && r.currentStatus === "OPEN") return true;
        if (tasks.includes("closed") && r.currentStatus === "CLOSED")
          return true;
        if (tasks.includes("cancelled") && r.currentStatus === "CANCELLED")
          return true;
        return tasks.length === 0;
      });
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((r) =>
        `${r.requestNumber} ${r.referenceNumber} ${r.nameOfCustomer}`
          .toLowerCase()
          .includes(q),
      );
    }
    return list;
  }, [requests, tasks, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by request number, reference or customer…"
            className="h-9 w-full rounded-lg bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 ring-1 ring-inset ring-ink-100 focus:ring-2 focus:ring-signal-500 dark:bg-ink-800 dark:text-ink-50 dark:ring-ink-700 dark:placeholder:text-ink-500"
          />
        </div>
        <Button variant="secondary" onClick={() => setFiltersOpen(true)}>
          <SlidersHorizontal className="h-4 w-4" />
          Filter by task
          {!tasks.includes("viewAll") && tasks.length > 0 && (
            <span className="ml-0.5 rounded-full bg-ink-900/10 px-1.5 text-xs dark:bg-white/15">
              {tasks.length}
            </span>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="No internal requests yet"
            description="Site visit and outsource requests raised from an enquiry's Choose Your Action will show up here."
          />
        ) : (
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-230 text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-xs text-ink-400 dark:border-ink-800">
                    {[
                      "Creation date",
                      "Request number",
                      "Reference number",
                      "By",
                      "Type",
                      "Customer",
                      "Remarks",
                      "Status",
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
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="cursor-pointer border-b border-ink-50 last:border-0 hover:bg-ink-50/60 dark:border-ink-800 dark:hover:bg-ink-800/60"
                      onClick={() =>
                        r.typeOfRequest.startsWith("SITE_VISIT")
                          ? navigate(`/requests/${r.id}`)
                          : null
                      }
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 text-ink-500">
                        {formatDateTime(r.creationDate)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs font-medium text-ink-900 dark:text-ink-50">
                        {r.requestNumber}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-ink-500">
                        {r.referenceNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-100 text-[10px] font-semibold text-ink-600 dark:bg-ink-700 dark:text-ink-200">
                          {initials(r.requestedBy)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-ink-600">
                        {TYPE_LABEL[r.typeOfRequest] || r.typeOfRequest}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-ink-50">
                        {r.nameOfCustomer}
                      </td>
                      <td className="max-w-55 truncate px-5 py-3.5 text-ink-500">
                        {r.remarks || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[r.currentStatus]}`}
                        >
                          {r.currentStatus}
                        </span>
                      </td>
                      <td />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <TaskFilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        tasks={INTERNAL_REQUEST_FILTER_TASKS}
        activeTasks={tasks}
        onApply={(next) => {
          setTasks(next);
          setFiltersOpen(false);
        }}
      />
    </div>
  );
}
