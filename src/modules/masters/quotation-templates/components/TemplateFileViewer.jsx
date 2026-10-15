import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Download, FileQuestion, X } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";
import "./templateFileViewer.css";

/** Full-height viewer for a template file: PDF in the browser viewer, Word rendered as a page. */
export function TemplateFileViewer({ preview, onClose, onDownload }) {
  return createPortal(
    <AnimatePresence>
      {preview && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
          <motion.div
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={preview.name}
            className="relative flex h-full max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-panel dark:bg-ink-900"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center justify-between gap-3 bg-ink-950 px-5 py-3">
              <div className="min-w-0">
                <h2 className="truncate font-display text-sm font-semibold text-white">
                  {preview.template.name}
                </h2>
                <p className="truncate text-xs text-ink-300">
                  {preview.name} · {preview.ext.toUpperCase()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button size="sm" variant="secondary" onClick={onDownload}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-ink-300 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 bg-ink-100 dark:bg-ink-950">
              {preview.kind === "pdf" && (
                <iframe
                  title={preview.name}
                  src={preview.url}
                  className="h-full w-full"
                />
              )}
              {preview.kind === "image" && (
                <div className="flex h-full items-center justify-center overflow-auto p-6">
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="max-h-full max-w-full"
                  />
                </div>
              )}
              {preview.kind === "docx" && (
                <div className="h-full overflow-y-auto px-3 py-6 sm:px-8">
                  <article
                    className="doc-preview"
                    // sanitised with DOMPurify in useTemplateFile
                    dangerouslySetInnerHTML={{ __html: preview.html }}
                  />
                </div>
              )}
              {preview.kind === "other" && (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                  <FileQuestion className="h-10 w-10 text-ink-300" />
                  <p className="text-sm text-ink-500">
                    This file type can't be previewed here.
                  </p>
                  <Button size="sm" onClick={onDownload}>
                    <Download className="h-4 w-4" />
                    Download {preview.ext.toUpperCase()}
                  </Button>
                </div>
              )}
            </div>
            {preview.kind === "docx" && (
              <p className="border-t border-ink-100 px-5 py-2 text-xs text-ink-400 dark:border-ink-800">
                Word preview — layout is simplified (headers, footers and page breaks
                aren't shown). Download to see the original.
              </p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
