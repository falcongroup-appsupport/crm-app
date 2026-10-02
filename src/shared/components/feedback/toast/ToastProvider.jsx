import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "../../../utils/cn";
import { ToastContext } from "./toastContext";

const MAX_VISIBLE = 4;
const DEFAULT_DURATION = {
  success: 4000,
  info: 4500,
  warning: 6000,
  error: 8000,
};

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconClass:
      "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
    bar: "bg-emerald-500",
  },
  error: {
    icon: XCircle,
    iconClass:
      "text-signal-600 bg-signal-50 dark:text-signal-400 dark:bg-signal-500/10",
    bar: "bg-signal-500",
  },
  warning: {
    icon: AlertTriangle,
    iconClass:
      "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10",
    bar: "bg-amber-500",
  },
  info: {
    icon: Info,
    iconClass: "text-ink-700 bg-ink-100 dark:text-ink-200 dark:bg-ink-800",
    bar: "bg-ink-400",
  },
};

let nextId = 0;

function ToastItem({ toast, onDismiss }) {
  const { icon: Icon, iconClass, bar } = VARIANTS[toast.type] ?? VARIANTS.info;
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);
  const remaining = useRef(toast.duration);
  const startedAt = useRef(0);

  // Auto-dismiss that pauses while hovered / focused. The timer is (re)started
  // from event callbacks and a ref callback — never from a render.
  const start = useCallback(() => {
    if (!toast.duration) return;
    clearTimeout(timer.current);
    startedAt.current = Date.now();
    timer.current = setTimeout(() => onDismiss(toast.id), remaining.current);
  }, [toast.duration, toast.id, onDismiss]);

  const pause = () => {
    if (!toast.duration) return;
    clearTimeout(timer.current);
    remaining.current = Math.max(
      0,
      remaining.current - (Date.now() - startedAt.current),
    );
    setPaused(true);
  };
  const resume = () => {
    setPaused(false);
    start();
  };

  const mountRef = useCallback(
    (node) => {
      if (node) start();
      else clearTimeout(timer.current);
    },
    [start],
  );

  return (
    <motion.li
      ref={mountRef}
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      role={toast.type === "error" ? "alert" : "status"}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className="pointer-events-auto relative w-full overflow-hidden rounded-xl bg-white shadow-[0_2px_6px_rgba(10,10,10,0.06),0_16px_40px_rgba(10,10,10,0.14)] ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800"
    >
      <div className="flex items-start gap-3 p-4 pr-10">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            iconClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold text-ink-950 dark:text-white">
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-0.5 wrap-break-word text-sm leading-snug text-ink-500 dark:text-ink-400">
              {toast.description}
            </p>
          )}
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action.onClick?.();
                onDismiss(toast.id);
              }}
              className="mt-2 text-sm font-semibold text-signal-600 hover:text-signal-700 dark:text-signal-400"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="absolute right-2.5 top-2.5 rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
      {toast.duration > 0 && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-0 left-0 h-1 w-full origin-left opacity-70",
            bar,
          )}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      )}
    </motion.li>
  );
}

/** App-wide toasts. Wrap the app once; use the useToast() hook anywhere below it. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(
    (id) => setToasts((list) => list.filter((t) => t.id !== id)),
    [],
  );

  const show = useCallback((type, title, options = {}) => {
    const id = ++nextId;
    const toast = {
      id,
      type,
      title,
      description: options.description,
      action: options.action,
      duration: options.duration ?? DEFAULT_DURATION[type],
    };
    setToasts((list) => [...list, toast].slice(-MAX_VISIBLE));
    return id;
  }, []);

  const api = useMemo(
    () => ({
      show,
      dismiss,
      success: (title, o) => show("success", title, o),
      error: (title, o) => show("error", title, o),
      warning: (title, o) => show("warning", title, o),
      info: (title, o) => show("info", title, o),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <ol
          aria-live="polite"
          aria-label="Notifications"
          className="pointer-events-none fixed inset-x-3 top-10 z-100 flex flex-col gap-2.5 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-95"
        >
          <AnimatePresence initial={false}>
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </ol>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
