import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export function Drawer({ open, onClose, title, subtitle, width = "max-w-lg", children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            className={`relative flex h-full w-full ${width} flex-col bg-white shadow-panel dark:bg-ink-900`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
          >
            <div className="flex items-start justify-between border-b border-ink-100 px-6 py-5 dark:border-ink-800">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink-950 dark:text-white">{title}</h2>
                {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close panel"
                className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="border-t border-ink-100 px-6 py-4 dark:border-ink-800">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
