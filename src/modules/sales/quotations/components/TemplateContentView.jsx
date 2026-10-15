import { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import "../../../../shared/components/forms/richText.css";

/**
 * Read-only template sections (scope, general considerations, deliverables, equipment)
 * as saved on the quotation — styled like the PDF, sanitised before rendering.
 */
export function TemplateContentView({ html }) {
  const [open, setOpen] = useState(false);
  const clean = useMemo(
    () =>
      html
        ? DOMPurify.sanitize(html, {
            ADD_ATTR: ["data-width"],
            ALLOWED_URI_REGEXP: /^(?:https?:|data:image\/|blob:)/i,
          })
        : "",
    [html],
  );
  const long = clean.length > 6000 || (clean.match(/<img/g) ?? []).length > 0;

  if (!clean)
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-ink-200 px-4 py-6 text-sm text-ink-400 dark:border-ink-700">
        <FileText className="h-5 w-5 shrink-0" />
        No template content on this quotation — edit it to load a template or write the
        scope, considerations, deliverables and equipment sections.
      </div>
    );

  return (
    <div>
      <div
        className={`relative overflow-hidden rounded-lg bg-white ring-1 ring-ink-100 dark:ring-ink-700 ${
          long && !open ? "max-h-[28rem]" : ""
        }`}
      >
        <div
          className="rte-content rte-readonly px-6 py-5 sm:px-10 sm:py-8"
          // sanitised above with DOMPurify
          dangerouslySetInnerHTML={{ __html: clean }}
        />
        {long && !open && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white" />
        )}
      </div>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-signal-600 hover:text-signal-700 dark:text-signal-400"
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {open ? "Show less" : "Show full content"}
        </button>
      )}
    </div>
  );
}
