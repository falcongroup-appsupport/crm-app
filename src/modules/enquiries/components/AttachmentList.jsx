import { useState } from "react";
import { Modal } from "../../../shared/components/ui/Modal";
import { Button } from "../../../shared/components/ui/Button";
import { Download, Eye, FileImage, FileSpreadsheet, FileText, File as FileIcon, Loader2, Trash2, Undo2 } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge";
import { cn } from "../../../shared/utils/cn";
import { attachmentApi } from "../api/attachment.api";

const ext = (name = "") => name.split(".").pop()?.toLowerCase() ?? "";
const IMAGE = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
const PREVIEWABLE = ["pdf", "txt", ...IMAGE];

function iconFor(name) {
  const e = ext(name);
  if (IMAGE.includes(e)) return FileImage;
  if (["xls", "xlsx", "csv"].includes(e)) return FileSpreadsheet;
  if (["pdf", "doc", "docx", "txt"].includes(e)) return FileText;
  return FileIcon;
}

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_TONE = {
  PERMIT: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30",
  DRAWING: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30",
};

/**
 * Saved attachments (GET /api/enquiry/{id} → attachments[]): preview PDFs and
 * images in an in-app viewer, or download any file. Pass `onToggleRemove` + `removedIds` on the edit
 * page to mark files for deletion; they're only deleted when the form is saved.
 */
export function AttachmentList({ attachments = [], onToggleRemove, removedIds = [], emptyText = "No attachments." }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null); // null | { att, url, kind }

  if (!attachments.length) return <p className="text-sm text-ink-400">{emptyText}</p>;

  const saveBlob = (url, name) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const open = async (att, mode) => {
    setError(null);
    setBusyId(att.id);
    try {
      const blob = await attachmentApi.fetchBlob(att.filePath);
      const url = URL.createObjectURL(blob);
      if (mode === "view") {
        setPreview({ att, url, kind: IMAGE.includes(ext(att.fileName)) ? "image" : "frame" });
      } else {
        saveBlob(url, att.fileName);
        setTimeout(() => URL.revokeObjectURL(url), 30_000);
      }
    } catch (err) {
      setError(`Couldn't open "${att.fileName}": ${err?.message || "request failed"}`);
    } finally {
      setBusyId(null);
    }
  };

  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  return (
    <div>
      <ul className="divide-y divide-ink-50 dark:divide-ink-800">
        {attachments.map((att) => {
          const Icon = iconFor(att.fileName);
          const removed = removedIds.includes(att.id);
          const busy = busyId === att.id;
          return (
            <li key={att.id ?? att.fileName} className={cn("flex items-center justify-between gap-3 py-2.5", removed && "opacity-50")}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 dark:bg-ink-800">
                  <Icon className="h-4 w-4 text-ink-500 dark:text-ink-300" />
                </span>
                <div className="min-w-0">
                  <p className={cn("truncate text-sm font-medium text-ink-900 dark:text-ink-50", removed && "line-through")}>{att.fileName}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-400">
                    {att.fileType && <Badge tone={TYPE_TONE[att.fileType]} className="px-2 py-0.5 text-[10px]">{att.fileType}</Badge>}
                    <span>{formatBytes(att.fileSize)}</span>
                    {removed && <span className="text-signal-600 dark:text-signal-400">Will be removed on save</span>}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {busy && <Loader2 className="h-4 w-4 animate-spin text-ink-400" />}
                {PREVIEWABLE.includes(ext(att.fileName)) && (
                  <button type="button" onClick={() => open(att, "view")} disabled={busy || removed} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-40 dark:hover:bg-ink-800 dark:hover:text-white" title="View" aria-label={`View ${att.fileName}`}>
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                <button type="button" onClick={() => open(att, "download")} disabled={busy || removed} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-40 dark:hover:bg-ink-800 dark:hover:text-white" title="Download" aria-label={`Download ${att.fileName}`}>
                  <Download className="h-4 w-4" />
                </button>
                {onToggleRemove && (
                  <button
                    type="button"
                    onClick={() => onToggleRemove(att.id)}
                    className={cn("rounded-md p-1.5", removed ? "text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800" : "text-ink-400 hover:bg-signal-50 hover:text-signal-600 dark:hover:bg-signal-500/10")}
                    title={removed ? "Keep this file" : "Remove this file"}
                    aria-label={removed ? `Keep ${att.fileName}` : `Remove ${att.fileName}`}
                  >
                    {removed ? <Undo2 className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {error && <p className="mt-2 text-xs text-signal-600 dark:text-signal-400">{error}</p>}

      <Modal
        open={Boolean(preview)}
        onClose={closePreview}
        title={preview?.att.fileName ?? ""}
        subtitle={preview ? [preview.att.fileType, formatBytes(preview.att.fileSize)].filter(Boolean).join(" · ") : ""}
        width="max-w-5xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={closePreview}>
              Close
            </Button>
            <Button size="sm" onClick={() => preview && saveBlob(preview.url, preview.att.fileName)}>
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        }
      >
        {preview?.kind === "image" ? (
          <div className="flex max-h-[68vh] items-center justify-center overflow-auto rounded-lg bg-ink-50 p-2 dark:bg-ink-800">
            <img src={preview.url} alt={preview.att.fileName} className="max-h-[66vh] max-w-full object-contain" />
          </div>
        ) : preview ? (
          <iframe src={preview.url} title={preview.att.fileName} className="h-[68vh] w-full rounded-lg bg-white ring-1 ring-ink-100 dark:ring-ink-800" />
        ) : null}
      </Modal>
    </div>
  );
}
