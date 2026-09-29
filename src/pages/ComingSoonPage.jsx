import { useParams } from "react-router-dom";
import { Construction } from "lucide-react";

function titleize(slug) {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ComingSoonPage({ title }) {
  const { label } = useParams();
  const resolvedTitle = title || (label ? titleize(label) : "This module");

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white/60 px-6 py-24 text-center dark:border-ink-700 dark:bg-ink-900/40">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-50 dark:bg-ink-800">
        <Construction className="h-5 w-5 text-ink-400" />
      </div>
      <h2 className="mt-4 font-display text-base font-semibold text-ink-900 dark:text-white">
        {resolvedTitle} is next up
      </h2>
      <p className="mt-1 max-w-xs text-sm text-ink-400">
        We're building this system module by module — Enquiry Registration and
        Internal Requests are live, this one follows the same doc.
      </p>
    </div>
  );
}
