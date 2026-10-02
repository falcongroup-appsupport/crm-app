import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";
import { Badge } from "../../../../shared/components/ui/Badge";
import { Toggle } from "../../../../shared/components/forms/Toggle";
import { Loader } from "../../../../shared/components/feedback/Loader";
import { EmptyState } from "../../../../shared/components/feedback/EmptyState";
import { ConfirmDialog } from "../../../../shared/components/feedback/ConfirmDialog";
import { Pagination } from "../../../../shared/components/tables/Pagination";
import { formatDate } from "../../../../shared/utils";
import { useQuotationTemplates } from "../hooks/useQuotationTemplates";
import { useToast } from "../../../../shared/components/feedback/toast/useToast";
import { TemplateFormModal } from "../components/TemplateFormModal";

export default function QuotationTemplatesPage() {
  const [activeOnly, setActiveOnly] = useState(false);
  const {
    templates,
    page,
    totalPages,
    loading,
    error,
    goToPage,
    create,
    update,
    remove,
  } = useQuotationTemplates({ activeOnly });
  const [editing, setEditing] = useState(null); // null | "new" | template
  const [pendingDelete, setPendingDelete] = useState(null);
  const toast = useToast();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-950 dark:text-white">
            Quotation templates
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            Document templates used when issuing quotations.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-500">Active only</span>
            <Toggle checked={activeOnly} onChange={setActiveOnly} />
          </div>
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" />
            New template
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-signal-50 px-4 py-2.5 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-xl bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
          <Loader label="Loading templates…" />
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          title="No templates yet"
          description="Upload a PDF or DOCX to create the first one."
          actionLabel="New template"
          onAction={() => setEditing("new")}
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs text-ink-400 dark:border-ink-800">
                {["Name", "File", "Status", "Created", ""].map((c) => (
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
              {templates.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-ink-50 last:border-0 dark:border-ink-800"
                >
                  <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-ink-50">
                    {t.name}
                  </td>
                  <td className="px-5 py-3.5 text-ink-600 dark:text-ink-300">
                    {t.fileName ?? t.originalFileName ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    {t.active === undefined ? (
                      <span className="text-ink-400">—</span>
                    ) : t.active ? (
                      <Badge tone="bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
                        Active
                      </Badge>
                    ) : (
                      <Badge>Inactive</Badge>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-ink-500">
                    {formatDate(t.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(t)}
                        className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
                        aria-label={`Edit ${t.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setPendingDelete(t);
                        }}
                        className="rounded-md p-1.5 text-ink-400 hover:bg-signal-50 hover:text-signal-600 dark:hover:bg-signal-500/10"
                        aria-label={`Delete ${t.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={goToPage} />

      <TemplateFormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        template={editing && editing !== "new" ? editing : null}
        onSubmit={(data) =>
          editing === "new" ? create(data) : update(editing.id, data)
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this template?"
        description={
          pendingDelete ? `“${pendingDelete.name}” will be removed.` : ""
        }
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          try {
            await remove(pendingDelete.id);
            toast.success("Template deleted", {
              description: pendingDelete.name,
            });
          } catch (err) {
            toast.error("Couldn't delete the template", {
              description: err?.message || "Please try again.",
            });
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
