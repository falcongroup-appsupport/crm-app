import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "max-w-xl",
}) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`relative flex max-h-[88vh] w-full ${width} flex-col overflow-hidden rounded-xl bg-white shadow-panel dark:bg-ink-900`}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-start justify-between border-b border-ink-100 bg-ink-950 px-5 py-4">
              <div>
                <h2 className="font-display text-base font-semibold text-white">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-xs text-ink-300">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-ink-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && (
              <div className="border-t border-ink-100 px-5 py-4 dark:border-ink-800">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
