import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { initials } from "../../shared/utils/initials";

const NAME = "Ansil Rahman K";
const ROLE = "Frontend Developer";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [
    { label: "Profile", icon: User, onClick: () => setOpen(false) },
    { label: "Settings", icon: Settings, onClick: () => setOpen(false) },
    { label: "Log out", icon: LogOut, danger: true, onClick: () => setOpen(false) },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-ink-50 dark:hover:bg-ink-800"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white dark:bg-ink-100 dark:text-ink-900">
          {initials(NAME)}
        </div>
        <ChevronDown className={`hidden h-3.5 w-3.5 text-ink-400 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl bg-white shadow-panel ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800"
          >
            <div className="border-b border-ink-100 px-4 py-3 dark:border-ink-800">
              <p className="truncate text-sm font-medium text-ink-900 dark:text-ink-50">{NAME}</p>
              <p className="truncate text-xs text-ink-400">{ROLE}</p>
            </div>
            <div className="p-1.5">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    item.danger
                      ? "text-signal-600 hover:bg-signal-50 dark:hover:bg-signal-900/20"
                      : "text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
