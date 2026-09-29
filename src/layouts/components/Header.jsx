import { Menu, PanelLeftClose, PanelLeftOpen, Bell } from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ title, onMenuClick, collapsed, onToggleCollapse }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-ink-100 bg-white px-4 dark:border-ink-800 dark:bg-ink-900 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-ink-500 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={onToggleCollapse}
        className="hidden rounded-lg p-2 text-ink-500 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800 lg:flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>

      <h1 className="font-display text-[17px] font-semibold text-ink-950 dark:text-white">{title}</h1>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <button
          className="relative rounded-lg p-2 text-ink-500 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-signal-500" />
        </button>
        <ProfileMenu />
      </div>
    </header>
  );
}
