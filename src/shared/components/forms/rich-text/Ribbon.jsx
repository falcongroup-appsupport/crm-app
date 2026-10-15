import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../utils/cn";

const keep = (e) => e.preventDefault(); // keep the editor selection on toolbar clicks

/** Small (icon) or large (icon over label) ribbon button. */
export function RibbonButton({
  icon: Icon,
  label,
  shortcut,
  active,
  disabled,
  onClick,
  large,
  showLabel,
  className,
}) {
  const tip = shortcut ? `${label} (${shortcut})` : label;
  return (
    <button
      type="button"
      title={tip}
      aria-label={label}
      aria-pressed={active ?? undefined}
      disabled={disabled}
      onMouseDown={keep}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-200/60 disabled:pointer-events-none disabled:opacity-30 dark:text-ink-200 dark:hover:bg-ink-700/70",
        large
          ? "h-[3.75rem] min-w-[3.5rem] flex-col gap-1 px-2 text-[11px] font-medium leading-tight"
          : showLabel
            ? "h-7 gap-1.5 px-2 text-xs font-medium"
            : "h-7 w-7",
        active &&
          "bg-signal-100 text-signal-700 hover:bg-signal-100 dark:bg-signal-500/20 dark:text-signal-300",
        className,
      )}
    >
      {Icon && (
        <Icon className={large ? "h-6 w-6" : "h-4 w-4"} strokeWidth={large ? 1.6 : 2} />
      )}
      {(large || showLabel) && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}

/** A labelled group of ribbon controls with a divider, like Word. */
export function RibbonGroup({ label, children, className }) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between border-r border-ink-200 px-2 last:border-r-0 dark:border-ink-700",
        className,
      )}
    >
      <div className="flex min-h-[3.75rem] flex-wrap items-center gap-0.5">
        {children}
      </div>
      <p className="mt-0.5 hidden text-center text-[10px] text-ink-400 sm:block">
        {label}
      </p>
    </div>
  );
}

/** Stacks small buttons in two rows inside a group. */
export const Rows = ({ children }) => (
  <div className="flex flex-col justify-center gap-0.5">{children}</div>
);
export const Row = ({ children }) => (
  <div className="flex items-center gap-0.5">{children}</div>
);

/** Button that opens a dropdown panel under it (closes on outside click / Escape). */
export function RibbonMenu({ icon, label, large, showLabel, children, panelClassName }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onMouseDown={keep}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-200/60 dark:text-ink-200 dark:hover:bg-ink-700/70",
          large
            ? "h-[3.75rem] min-w-[3.5rem] flex-col gap-1 px-2 text-[11px] font-medium"
            : showLabel
              ? "h-7 gap-1 px-2 text-xs font-medium"
              : "h-7 gap-0.5 px-1",
          open && "bg-ink-200/70 dark:bg-ink-700",
        )}
      >
        {icon}
        {(large || showLabel) && (
          <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
            {label}
            <ChevronDown className="h-3 w-3" />
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute left-0 top-full z-40 mt-1 rounded-lg bg-white p-1.5 shadow-xl ring-1 ring-ink-200 dark:bg-ink-900 dark:ring-ink-700",
            panelClassName,
          )}
        >
          {typeof children === "function" ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ children, onClick, hint }) {
  return (
    <button
      type="button"
      role="menuitem"
      onMouseDown={keep}
      onClick={onClick}
      className="flex w-full items-center justify-between gap-6 rounded-md px-2.5 py-1.5 text-left text-sm text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
    >
      <span>{children}</span>
      {hint && <span className="text-xs text-ink-400">{hint}</span>}
    </button>
  );
}

export function RibbonTab({ active, contextual, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onMouseDown={keep}
      onClick={onClick}
      className={cn(
        "relative h-9 px-3 text-sm font-medium transition-colors",
        active
          ? "text-ink-950 dark:text-white"
          : "text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white",
        contextual && "text-signal-600 dark:text-signal-400",
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-signal-600" />
      )}
    </button>
  );
}
