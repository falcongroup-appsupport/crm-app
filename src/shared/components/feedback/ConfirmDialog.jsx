import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { HelpCircle, TriangleAlert } from "lucide-react";
import { Button } from "../ui/Button";

/**
 * tone="danger" (default) for destructive actions; tone="primary" for
 * ordinary confirmations such as a status change. `description` can be any node.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  tone = "danger",
  busy = false,
}) {
  const danger = tone === "danger";
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
          <motion.div
            className="absolute inset-0 bg-ink-950/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={busy ? undefined : onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-panel dark:bg-ink-900"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${danger ? "bg-signal-50 dark:bg-signal-500/10" : "bg-ink-100 dark:bg-ink-800"}`}
            >
              {danger ? (
                <TriangleAlert className="h-5 w-5 text-signal-600 dark:text-signal-400" />
              ) : (
                <HelpCircle className="h-5 w-5 text-ink-600 dark:text-ink-300" />
              )}
            </div>
            <h3 className="mt-4 font-display text-base font-semibold text-ink-950 dark:text-white">
              {title}
            </h3>
            <div className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">
              {description}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onCancel}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                variant={danger ? "danger" : "primary"}
                size="sm"
                onClick={onConfirm}
                disabled={busy}
              >
                {busy ? "Working…" : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
