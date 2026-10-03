import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";
import { Badge } from "../../../../shared/components/ui/Badge";
import { Loader } from "../../../../shared/components/feedback/Loader";
import { Pagination } from "../../../../shared/components/tables/Pagination";
import { formatDateTime } from "../../../../shared/utils";
import { useFollowUps } from "../hooks/useFollowUps";
import { FOLLOW_UP_STATUS_LABEL } from "../constants/followUpConstants";
import { FollowUpModal } from "./FollowUpModal";
import { ErrorToast } from "../../../../shared/components/feedback/toast/ErrorToast";

export function FollowUpHistory({ quotation }) {
  const { items, page, totalPages, loading, error, goToPage, create } =
    useFollowUps(quotation.id);
  const [open, setOpen] = useState(false);

  return (
    <section
      id="follow-ups"
      className="scroll-mt-6 rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
          Sales follow-ups
        </p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add follow-up
        </Button>
      </div>

      {loading ? (
        <Loader label="Loading follow-ups…" className="py-8" />
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-400">
          No follow-ups logged yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs text-ink-400 dark:border-ink-800">
                {[
                  "Date",
                  "Type",
                  "Status",
                  "Contact",
                  "Response",
                  "Reported to",
                ].map((c) => (
                  <th
                    key={c}
                    className="whitespace-nowrap px-3 py-2 font-medium"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-ink-50 last:border-0 dark:border-ink-800"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 text-ink-500">
                    {formatDateTime(f.date)}
                  </td>
                  <td className="px-3 py-2.5 text-ink-700 dark:text-ink-200">
                    {f.type}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge>
                      {FOLLOW_UP_STATUS_LABEL[f.currentStatus] ??
                        f.currentStatus}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-ink-700 dark:text-ink-200">
                    {f.contactPerson}
                    <span className="block text-xs text-ink-400">
                      {f.contactNumber}
                    </span>
                  </td>
                  <td className="max-w-md px-3 py-2.5 text-ink-600 dark:text-ink-300">
                    {f.response}
                  </td>
                  <td className="px-3 py-2.5 text-ink-600 dark:text-ink-300">
                    {f.reportedTo || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3">
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={goToPage}
            />
          </div>
        </div>
      )}

      <ErrorToast
        error={error}
        title="Couldn't load follow-ups"
        onRetry={() => goToPage(page)}
      />
      <FollowUpModal
        open={open}
        onClose={() => setOpen(false)}
        quotation={quotation}
        onSubmit={create}
      />
    </section>
  );
}
