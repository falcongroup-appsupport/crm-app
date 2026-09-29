import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

function titleize(segment) {
  return segment
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-ink-400">
      <Link to="/" className="hover:text-ink-700 dark:hover:text-ink-200">
        Dashboard
      </Link>
      {segments.map((segment, i) => {
        const to = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        const label = /^\d+$/.test(segment) ? `#${segment}` : titleize(segment);
        return (
          <span key={to} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="font-medium text-ink-600 dark:text-ink-300">{label}</span>
            ) : (
              <Link to={to} className="hover:text-ink-700 dark:hover:text-ink-200">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
