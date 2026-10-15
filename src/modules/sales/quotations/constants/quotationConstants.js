export const CURRENCIES = ["AED", "USD", "EUR", "SAR", "QAR"];
export const DURATION_UNITS = ["Days", "Weeks"];
export const DEFAULT_VAT_PERCENTAGE = 5;

// Pre-filled duration rows, matching the sample quotation in CRM_APIS.pdf.
export const DEFAULT_DURATION_DESCRIPTIONS = [
  "NOC / Authority Permits",
  "Mobilization",
  "Field Works",
];

// Quotation `status` — only DRAFT has been seen from the API so far. Other
// values still render (title-cased, neutral colour) until they're listed here.
export const QUOTATION_STATUS_STYLES = {
  DRAFT:
    "bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:ring-ink-700",
  SUBMITTED:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30",
  SENT: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30",
  APPROVED:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
  ACCEPTED:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
  REJECTED:
    "bg-signal-50 text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30",
  CANCELLED:
    "bg-ink-100 text-ink-400 ring-1 ring-inset ring-ink-200 line-through dark:bg-ink-800 dark:ring-ink-700",
};

export const quotationStatusLabel = (status) =>
  status
    ? String(status)
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Not set";

/** The four template sections every quotation carries (all other parts come from quotation data). */
export const TEMPLATE_SECTIONS = [
  "Scope of Services",
  "General Considerations",
  "Reporting & Deliverables",
  "Equipment and Personnel",
];

const esc = (t) => t.replace(/&/g, "&amp;");

/** Empty outline with the four section headings, each with one empty bullet. */
export const STANDARD_OUTLINE_HTML = TEMPLATE_SECTIONS.map(
  (t) => `<h3>${esc(t)}</h3><ul><li><p></p></li></ul>`,
).join("");

/** Size limit for the saved template HTML (pictures included). */
export const TEMPLATE_MAX_CHARS = 2_000_000;
