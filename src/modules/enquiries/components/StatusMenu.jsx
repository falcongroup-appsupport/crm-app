import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge";
import { cn } from "../../../shared/utils/cn";
import {
  CURRENT_STATUSES,
  STATUS_LABEL,
  STATUS_STYLES,
} from "../constants/enquiryStatus";

const NOT_SET_TONE =
  "bg-ink-50 text-ink-400 ring-1 ring-inset ring-ink-100 dark:bg-ink-800 dark:text-ink-500 dark:ring-ink-700";

/**
 * Colored status button that opens a menu of every status — used on the
 * list page so a status can be changed without opening the enquiry.
 * The menu is portaled + fixed-positioned so the table's overflow can't clip it.
 */
export function StatusMenu({ status, onChange, busy = false }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, up: false });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 10 * 36 + 16;
    const up =
      window.innerHeight - rect.bottom < menuHeight && rect.top > menuHeight;
    setPos({ top: up ? rect.top - 6 : rect.bottom + 6, left: rect.left, up });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (
        menuRef.current?.contains(e.target) ||
        buttonRef.current?.contains(e.target)
      )
        return;
      setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const tone = status
    ? (STATUS_STYLES[status] ?? STATUS_STYLES.SELECT)
    : NOT_SET_TONE;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded-full transition-opacity hover:opacity-90 disabled:opacity-60"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Badge tone={tone} className="gap-1.5 pr-2">
          {status ? (STATUS_LABEL[status] ?? status) : "Not set"}
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ChevronDown className="h-3 w-3 opacity-70" />
          )}
        </Badge>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              top: pos.top,
              left: pos.left,
              transform: pos.up ? "translateY(-100%)" : undefined,
            }}
            className="fixed z-[80] w-60 rounded-xl bg-white p-1.5 shadow-panel ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800"
            onClick={(e) => e.stopPropagation()}
          >
            {CURRENT_STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                role="option"
                aria-selected={s.value === status}
                onClick={() => {
                  setOpen(false);
                  if (s.value !== status) onChange(s.value);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-ink-50 dark:hover:bg-ink-800",
                  s.value === status && "bg-ink-50 dark:bg-ink-800",
                )}
              >
                <Badge tone={STATUS_STYLES[s.value]}>{s.label}</Badge>
                {s.value === status && (
                  <Check className="h-4 w-4 text-ink-500" />
                )}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
