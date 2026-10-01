// Default shapes, normalisation and validation for the enquiry form.
import { CURRENT_STATUSES, ENQUIRY_SOURCES, PROJECT_STATUSES } from "../constants/enquiryStatus";

export const UAE = "United Arab Emirates";
export const NO_LEAD_LABEL = "No Lead";
export const isUae = (country) => country === UAE || country === "UAE";

/** Today's date in the user's timezone (toISOString() is UTC and can be "yesterday" in the UAE). */
export function todayLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export const emptyScope = () => ({ activityId: "", unit: "LS", quantity: 1, remarks: "" });

export const emptyProject = () => ({
  projectName: "",
  country: UAE,
  emirate: "Dubai",
  scopeOfServices: [emptyScope()],
});

export const emptyEnquiry = () => ({
  enquiryType: "NEW",
  dateOfEnquiry: todayLocal(),
  companyName: "",
  customerName: "",
  customerEmail: "",
  contactPerson: "",
  contactNumber: "",
  projectReference: "",
  projectLead: NO_LEAD_LABEL,
  currentStatus: "SELECT",
  projectStatus: "JOB_IN_HAND",
  remarks: "",
  submissionDeadline: "",
  source: ENQUIRY_SOURCES[0],
  siteVisit: { siteVisitRequired: false, gatePassRequired: false },
  projectInformations: [emptyProject()],
  attachments: [],
});

const str = (v) => (v === null || v === undefined ? "" : String(v));

/**
 * Turns a GET /api/enquiry/{id} record into safe form state. The backend
 * returns null for anything that was never filled in (siteVisit,
 * projectInformations, scopeOfServices, strings…) and the form must never
 * dereference those — site visit in particular is optional.
 */
export function normalizeEnquiry(data) {
  const base = emptyEnquiry();
  const sv = data?.siteVisit ?? {};
  const lead = str(data?.projectLead);

  return {
    ...base,
    ...data,
    companyName: str(data?.companyName),
    customerName: str(data?.customerName),
    customerEmail: str(data?.customerEmail),
    contactPerson: str(data?.contactPerson),
    contactNumber: str(data?.contactNumber),
    projectReference: str(data?.projectReference),
    projectLead: !lead || lead === "NO_LEAD" ? NO_LEAD_LABEL : lead,
    remarks: str(data?.remarks),
    dateOfEnquiry: data?.dateOfEnquiry ? str(data.dateOfEnquiry).slice(0, 10) : base.dateOfEnquiry,
    submissionDeadline: str(data?.submissionDeadline).slice(0, 10),
    currentStatus: data?.currentStatus ?? "",
    projectStatus: data?.projectStatus ?? "",
    siteVisit: {
      siteVisitRequired: Boolean(sv.siteVisitRequired),
      gatePassRequired: Boolean(sv.gatePassRequired),
      siteVisitAssignedTo: str(sv.siteVisitAssignedTo),
      siteVisitDate: str(sv.siteVisitDate).slice(0, 16), // datetime-local has no seconds
      contactPerson: str(sv.contactPerson),
      contactNumber: str(sv.contactNumber),
      googleMapLink: str(sv.googleMapLink),
    },
    projectInformations: data?.projectInformations?.length
      ? data.projectInformations.map((p) => ({
          ...p,
          projectName: str(p.projectName),
          // the backend stores whatever was sent ("UAE" in the API samples) — show it in the dropdown
          country: isUae(p.country) ? UAE : str(p.country),
          emirate: str(p.emirate),
          scopeOfServices: p.scopeOfServices?.length
            ? p.scopeOfServices.map((sc) => ({ ...sc, activityId: str(sc.activityId), unit: str(sc.unit) || "LS", quantity: sc.quantity ?? 1, remarks: str(sc.remarks) }))
            : [emptyScope()],
        }))
      : [emptyProject()],
    attachments: [], // existing files stay on the server; only new uploads are sent
  };
}

// ---- validation -----------------------------------------------------------

export const LIMITS = {
  companyName: 150,
  customerName: 100,
  contactPerson: 100,
  customerEmail: 150,
  projectReference: 50,
  projectLead: 100,
  remarks: 1000,
  projectName: 255,
  scopeRemarks: 500,
  siteVisitAssignedTo: 100,
  googleMapLink: 500,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_RE = /^\+?[\d\s\-()]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
const STATUS_VALUES = CURRENT_STATUSES.map((s) => s.value);
const PROJECT_STATUS_VALUES = PROJECT_STATUSES.map((s) => s.value);

const isBlank = (v) => str(v).trim() === "";
const isValidDate = (v) => DATE_RE.test(v) && !Number.isNaN(Date.parse(v));
const isValidDateTime = (v) => DATETIME_RE.test(v) && !Number.isNaN(Date.parse(v));

export function phoneError(value, { required = false } = {}) {
  const v = str(value).trim();
  if (!v) return required ? "Contact number is required" : null;
  if (!PHONE_CHARS_RE.test(v)) return "Use digits only (with an optional leading +)";
  const digits = v.replace(/\D/g, "").length;
  if (digits < 7 || digits > 15) return "Enter 7–15 digits";
  return null;
}

function urlError(value) {
  const v = str(value).trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" ? null : "Must start with http:// or https://";
  } catch {
    return "Enter a full link, e.g. https://maps.google.com/…";
  }
}

function maxLen(errors, key, value, max) {
  if (str(value).trim().length > max) errors[key] = `Keep this under ${max} characters`;
}

const MB = 1024 * 1024;

/**
 * Validates the whole enquiry form for both POST (create) and PUT (edit).
 * Returns { [fieldKey]: message } — empty object means valid. Keys:
 *   companyName, projects.0.projectName, projects.0.scope.1.quantity,
 *   siteVisit.siteVisitDate, attachments, …
 */
export function validateEnquiry(form, { mode = "create", files = [], maxFileMB = 0, maxRequestMB = 0 } = {}) {
  const e = {};
  const today = todayLocal();

  // customer / client
  if (isBlank(form.companyName)) e.companyName = "Company name is required";
  else maxLen(e, "companyName", form.companyName, LIMITS.companyName);
  if (isBlank(form.customerName)) e.customerName = "Customer / client name is required";
  else maxLen(e, "customerName", form.customerName, LIMITS.customerName);
  maxLen(e, "contactPerson", form.contactPerson, LIMITS.contactPerson);
  const phone = phoneError(form.contactNumber);
  if (phone) e.contactNumber = phone;
  if (!isBlank(form.customerEmail)) {
    if (!EMAIL_RE.test(str(form.customerEmail).trim())) e.customerEmail = "Enter a valid email address";
    else maxLen(e, "customerEmail", form.customerEmail, LIMITS.customerEmail);
  }

  // enquiry details
  if (isBlank(form.dateOfEnquiry)) e.dateOfEnquiry = "Enquiry date is required";
  else if (!isValidDate(form.dateOfEnquiry)) e.dateOfEnquiry = "Enter a valid date";
  else if (form.dateOfEnquiry > today) e.dateOfEnquiry = "Enquiry date can't be in the future";

  if (!isBlank(form.submissionDeadline)) {
    if (!isValidDate(form.submissionDeadline)) e.submissionDeadline = "Enter a valid date";
    else if (isValidDate(form.dateOfEnquiry) && form.submissionDeadline < form.dateOfEnquiry)
      e.submissionDeadline = "Deadline can't be before the enquiry date";
  }
  maxLen(e, "projectReference", form.projectReference, LIMITS.projectReference);
  maxLen(e, "projectLead", form.projectLead, LIMITS.projectLead);
  maxLen(e, "remarks", form.remarks, LIMITS.remarks);

  if (isBlank(form.projectStatus)) {
    if (mode === "create") e.projectStatus = "Project status is required";
  } else if (!PROJECT_STATUS_VALUES.includes(form.projectStatus)) e.projectStatus = "Pick a valid project status";

  if (isBlank(form.currentStatus)) {
    if (mode === "create") e.currentStatus = "Current status is required";
  } else if (!STATUS_VALUES.includes(form.currentStatus)) e.currentStatus = "Pick a valid status";

  // projects + scope of services
  const projects = form.projectInformations ?? [];
  if (projects.length === 0) e.projects = "Add at least one project";
  projects.forEach((p, i) => {
    const k = `projects.${i}`;
    if (isBlank(p.projectName)) e[`${k}.projectName`] = "Project name is required";
    else maxLen(e, `${k}.projectName`, p.projectName, LIMITS.projectName);
    if (isBlank(p.country)) e[`${k}.country`] = "Country is required";
    if (isUae(p.country) && isBlank(p.emirate)) e[`${k}.emirate`] = "Emirate is required for UAE projects";

    const scopes = p.scopeOfServices ?? [];
    if (scopes.length === 0) e[`${k}.scope`] = "Add at least one activity";
    scopes.forEach((s, j) => {
      const sk = `${k}.scope.${j}`;
      if (isBlank(s.activityId)) e[`${sk}.activityId`] = "Select an activity";
      if (isBlank(s.unit)) e[`${sk}.unit`] = "Select a unit";
      const q = Number(s.quantity);
      if (isBlank(s.quantity)) e[`${sk}.quantity`] = "Quantity is required";
      else if (!Number.isFinite(q) || q <= 0) e[`${sk}.quantity`] = "Quantity must be greater than 0";
      else if (q > 1_000_000_000) e[`${sk}.quantity`] = "Quantity is too large";
      if (str(s.remarks).trim().length > LIMITS.scopeRemarks) e[`${sk}.remarks`] = `Keep remarks under ${LIMITS.scopeRemarks} characters`;
    });
  });

  // site visit — only validated when it's required
  const sv = form.siteVisit ?? {};
  if (sv.siteVisitRequired) {
    if (isBlank(sv.siteVisitAssignedTo)) e["siteVisit.siteVisitAssignedTo"] = "Assign the site visit to someone";
    else maxLen(e, "siteVisit.siteVisitAssignedTo", sv.siteVisitAssignedTo, LIMITS.siteVisitAssignedTo);
    if (isBlank(sv.siteVisitDate)) e["siteVisit.siteVisitDate"] = "Site visit date & time is required";
    else if (!isValidDateTime(sv.siteVisitDate)) e["siteVisit.siteVisitDate"] = "Enter a valid date & time";
    else if (mode === "create" && sv.siteVisitDate.slice(0, 10) < today) e["siteVisit.siteVisitDate"] = "Site visit can't be scheduled in the past";
    if (isBlank(sv.contactPerson)) e["siteVisit.contactPerson"] = "Site contact person is required";
    else maxLen(e, "siteVisit.contactPerson", sv.contactPerson, LIMITS.contactPerson);
    const svPhone = phoneError(sv.contactNumber, { required: true });
    if (svPhone) e["siteVisit.contactNumber"] = svPhone;
    const link = urlError(sv.googleMapLink);
    if (link) e["siteVisit.googleMapLink"] = link;
    else maxLen(e, "siteVisit.googleMapLink", sv.googleMapLink, LIMITS.googleMapLink);
  }

  // uploads — catches oversized files here instead of a server 413
  const realFiles = files.map((f) => f.file).filter(Boolean);
  if (maxFileMB) {
    const big = realFiles.filter((f) => f.size > maxFileMB * MB);
    if (big.length) e.attachments = `${big.map((f) => f.name).join(", ")} ${big.length > 1 ? "are" : "is"} over the ${maxFileMB} MB per-file limit`;
  }
  if (!e.attachments && maxRequestMB) {
    const total = realFiles.reduce((s, f) => s + f.size, 0);
    if (total > maxRequestMB * MB) e.attachments = `Attachments total ${(total / MB).toFixed(1)} MB — the limit is ${maxRequestMB} MB per enquiry`;
  }

  return e;
}
