// Enum values match the backend exactly (CRM_APIS.pdf) — do not relabel the
// `value`, only the `label` / color are presentational.

export const CURRENT_STATUSES = [
  { value: "SELECT", label: "Select" },
  { value: "SITE_VISIT_REQUIRED", label: "Site Visit Required" },
  { value: "UNDER_ESTIMATION", label: "Under Estimation" },
  { value: "UNDER_APPROVAL_INTERNAL", label: "Under Approval (Internal)" },
  { value: "QUOTATION_APPROVED", label: "Quotation Approved" },
  { value: "UNDER_CLARIFICATIONS", label: "Under Clarifications" },
  { value: "QUOTATION_DELIVERED", label: "Quotation Delivered" },
  { value: "QUOTATION_ON_PROGRESS", label: "Quotation on Progress" },
  { value: "NOT_SUBMITTED", label: "Not Submitted" },
  { value: "SALES_ORDER_CREATED", label: "Sales Order Created" },
];

export const STATUS_LABEL = Object.fromEntries(CURRENT_STATUSES.map((s) => [s.value, s.label]));

// Color coding intentionally uses Tailwind's full palette (not just the
// brand red/black tokens) — with ten distinct pipeline stages, scannability
// matters more than palette purity here. Brand red is reserved for the one
// truly urgent state (NOT_SUBMITTED).
export const STATUS_STYLES = {
  SELECT: "bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:ring-ink-700",
  SITE_VISIT_REQUIRED:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30",
  UNDER_ESTIMATION: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30",
  UNDER_APPROVAL_INTERNAL:
    "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/30",
  QUOTATION_APPROVED:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
  UNDER_CLARIFICATIONS: "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:ring-cyan-500/30",
  QUOTATION_DELIVERED: "bg-ink-900 text-white dark:bg-white dark:text-ink-950",
  QUOTATION_ON_PROGRESS: "bg-amber-500 text-white",
  NOT_SUBMITTED: "bg-signal-600 text-white",
  SALES_ORDER_CREATED: "bg-violet-600 text-white",
};

export const PROJECT_STATUSES = [
  { value: "TENDER", label: "Tender" },
  { value: "BIDDING", label: "Bidding" },
  { value: "JOB_IN_HAND", label: "Job In Hand" },
];

export const PROJECT_STATUS_LABEL = Object.fromEntries(PROJECT_STATUSES.map((s) => [s.value, s.label]));

export const ENQUIRY_SOURCES = ["Email", "Email Fetch", "Website", "Referral", "Phone Call", "Walk-in", "Exhibition"];

export const COUNTRIES = ["United Arab Emirates", "Saudi Arabia", "Qatar", "Oman", "Bahrain", "Kuwait", "Other"];

export const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];

export const SCOPE_UNITS = ["LS", "SQM", "SQFT", "NOS", "RM", "LM", "HRS", "DAYS"];

export const PROJECT_LEADS = ["No Lead", "Ganesh", "Fatima Al Suwaidi", "Rashid Al Marzooqi", "Meera Hassan", "Omar Sheikh"];

export const DEFAULT_ASSIGNEE = {
  siteVisit: "Project Manager",
  outsource: "Purchase Manager",
};

export const REQUIRED_DOCUMENTS = [
  "Passport, Visa",
  "Emirates ID",
  "Driving License",
  "Undertaking Letter",
  "Medical Reports",
  "Work Permit",
  "WMC",
  "Insurance",
  "Person Photo",
  "Tools Photos",
  "Mulkia",
  "Others",
];

// Filter-by-task checklist shown on the Enquiry Registration list, per the
// functional spec. Only a subset map to a real query today (status /
// customer / project fields) — the rest are placeholders until the backend
// exposes them, but are kept visible since the spec calls for them.
export const ENQUIRY_FILTER_TASKS = [
  { key: "viewAll", label: "View All" },
  { key: "pending", label: "Pending Enquiries" },
  { key: "underEstimation", label: "Under Estimation" },
  { key: "underReview", label: "Under Review" },
  { key: "underApproval", label: "Under Approval" },
  { key: "deliveredQuotation", label: "Delivered Quotation" },
  { key: "deadline", label: "Deadline" },
  { key: "untouched", label: "Untouched Enquiries" },
  { key: "tenders", label: "Tenders" },
  { key: "closed", label: "Closed Enquiries" },
  { key: "salesOrderCreated", label: "Sales Order Created" },
];

// PERMIT and DRAWING are the fileTypes shown in CRM_APIS.pdf; OTHER is a
// catch-all that the backend may or may not accept — confirm before relying on it.
export const ATTACHMENT_TYPES = ["DRAWING", "PERMIT", "OTHER"];
