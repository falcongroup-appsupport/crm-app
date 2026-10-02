import { Link } from "react-router-dom";
import { Crosshair } from "lucide-react";
import { ThemeToggle } from "../../../layouts/components/ThemeToggle";
import { ProfileMenu } from "../../../layouts/components/ProfileMenu";

/** Slim top bar for the full-screen landing page (no sidebar here). */
export function LandingHeader() {
  return (
    <header className="relative z-10 mx-auto flex h-28 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-signal-600">
          <Crosshair className="h-6 w-6 text-white" strokeWidth={2.25} />
        </span>
        <span className="leading-tight">
          <span className="block font-display text-lg font-semibold tracking-tight text-ink-950 dark:text-white">
            Falcon Survey Engineering
          </span>
          <span className="block text-sm text-ink-400">CRM</span>
        </span>
      </Link>
      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
