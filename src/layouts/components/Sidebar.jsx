import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, ChevronDown, X } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import {
  NAV_DASHBOARD,
  NAV_GROUPS as GROUPS,
} from "../../app/config/navigation";

function Brand({ collapsed }) {
  return (
    <NavLink
      to="/"
      className={cn(
        "flex items-center gap-2.5 py-5",
        collapsed ? "justify-center px-0" : "px-5",
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-signal-600">
        <Crosshair className="h-5 w-5 text-white" strokeWidth={2.25} />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold tracking-tight text-white">
            Falcon Survey Engineering
          </p>
          <p className="text-[11px] text-ink-400">CRM</p>
        </div>
      )}
    </NavLink>
  );
}

function DashboardLink({ onNavigate, collapsed }) {
  return (
    <NavLink
      to={NAV_DASHBOARD.to}
      end
      onClick={onNavigate}
      title={collapsed ? NAV_DASHBOARD.label : undefined}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors",
          collapsed ? "justify-center" : "px-3",
          isActive
            ? "bg-ink-900 text-white"
            : "text-ink-300 hover:bg-ink-900/60 hover:text-white",
        )
      }
    >
      <NAV_DASHBOARD.icon className="h-5 w-5 shrink-0" />
      {!collapsed && NAV_DASHBOARD.label}
    </NavLink>
  );
}

function NavGroups({ onNavigate, collapsed, onExpand }) {
  const { pathname } = useLocation();
  const [openGroup, setOpenGroup] = useState(() => {
    const activeGroup = GROUPS.find((g) =>
      g.items.some((i) => pathname.startsWith(i.to)),
    );
    return activeGroup?.label ?? GROUPS[0].label;
  });

  if (collapsed) {
    return (
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {GROUPS.map((group) => {
          const isActiveGroup = group.items.some((i) =>
            pathname.startsWith(i.to),
          );
          return (
            <button
              key={group.label}
              title={group.label}
              onClick={() => {
                setOpenGroup(group.label);
                onExpand();
              }}
              className={cn(
                "flex w-full items-center justify-center rounded-lg py-2.5 transition-colors",
                isActiveGroup
                  ? "bg-ink-900 text-white"
                  : "text-ink-400 hover:bg-ink-900/60 hover:text-white",
              )}
            >
              <group.icon className="h-5 w-5" />
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
      {GROUPS.map((group) => {
        const isOpen = openGroup === group.label;
        return (
          <div key={group.label}>
            <button
              onClick={() => setOpenGroup(isOpen ? null : group.label)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-300 transition-colors hover:bg-ink-900/60 hover:text-white"
            >
              <group.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">{group.label}</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="ml-7 space-y-0.5 border-l border-ink-800 py-1 pl-3">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.label}
                        to={item.to}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          cn(
                            "block rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                            isActive
                              ? "bg-ink-900 text-white"
                              : "text-ink-400 hover:bg-ink-900/60 hover:text-white",
                          )
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({ collapsed, onExpand }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 288 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="hidden shrink-0 flex-col overflow-hidden bg-ink-950 lg:flex"
    >
      <Brand collapsed={collapsed} />
      <div className={cn("pb-2", collapsed ? "px-2" : "px-3")}>
        <DashboardLink collapsed={collapsed} />
      </div>
      <NavGroups collapsed={collapsed} onExpand={onExpand} />
      {!collapsed && (
        <div className="border-t border-ink-800 px-5 py-4">
          <p className="text-[11px] leading-relaxed text-ink-500">
            Falcon Survey Engineering · field-to-office enquiry handling
          </p>
        </div>
      )}
    </motion.aside>
  );
}

export function MobileSidebar({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-ink-950/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative flex h-full w-72 flex-col bg-ink-950"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
          >
            <div className="flex items-center justify-between">
              <Brand collapsed={false} />
              <button
                onClick={onClose}
                className="mr-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-3 pb-2">
              <DashboardLink onNavigate={onClose} collapsed={false} />
            </div>
            <NavGroups
              onNavigate={onClose}
              collapsed={false}
              onExpand={() => {}}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
