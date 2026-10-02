// Default shapes, normalisation and validation for the enquiry form.
import {
  CURRENT_STATUSES,
  ENQUIRY_SOURCES,
  PROJECT_STATUSES,
} from "../constants/enquiryStatus";

export const UAE = "United Arab Emirates";
export const NO_LEAD_LABEL = "No Lead";
export const isUae = (country) => country === UAE || country === "UAE";

/** Today's date in the user's timezone (toISOString() is UTC and can be "yesterday" in the UAE). */
export function todayLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export const emptyScope = () => ({
  activityId: "",
  unit: "LS",
  quantity: 1,
  remarks: "",
});

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
    customerEmail: str(data?.customerEmail),
    // customer name and contact person are the same person — older records may only have customerName
    contactPerson: str(data?.contactPerson) || str(data?.customerName),
    contactNumber: str(data?.contactNumber),
    projectReference: str(data?.projectReference),
    projectLead: !lead || lead === "NO_LEAD" ? NO_LEAD_LABEL : lead,
    remarks: str(data?.remarks),
    dateOfEnquiry: data?.dateOfEnquiry
      ? str(data.dateOfEnquiry).slice(0, 10)
      : base.dateOfEnquiry,
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
          _saved: true,
          scopeOfServices: p.scopeOfServices?.length
            ? p.scopeOfServices.map((sc, j) => ({
                ...sc,
                activityId: str(sc.activityId),
                unit: str(sc.unit) || "LS",
                quantity: sc.quantity ?? 1,
                remarks: str(sc.remarks),
                _saved: true,
                _origIndex: j,
              }))
            : [emptyScope()],
        }))
      : [emptyProject()],
    // files already on the server (enquiry-level + site-visit permits)
    existingAttachments: [
      ...(data?.attachments ?? []),
      ...(data?.siteVisit?.attachments ?? []),
    ],
    attachments: [], // new uploads only
  };
}

/**
 * GET /api/enquiry/{id} currently returns scope rows with id: null, while the
 * list endpoint returns their real ids. Until the backend fixes that, copy the
 * ids over from the list row (matched by project id + position).
 */
export function fillScopeIds(record, listRow) {
  if (!record || !listRow?.projectInformations) return record;
  return {
    ...record,
    projectInformations: (record.projectInformations ?? []).map((p) => {
      const source = listRow.projectInformations.find((lp) => lp.id === p.id);
      if (!source) return p;
      return {
        ...p,
        scopeOfServices: (p.scopeOfServices ?? []).map((s, j) =>
          s.id == null && source.scopeOfServices?.[j]?.id != null
            ? { ...s, id: source.scopeOfServices[j].id }
            : s,
        ),
      };
    }),
  };
}

// ---- validation -----------------------------------------------------------

export const LIMITS = {
  companyName: 150,
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
const isValidDateTime = (v) =>
  DATETIME_RE.test(v) && !Number.isNaN(Date.parse(v));

export function phoneError(value, { required = false } = {}) {
  const v = str(value).trim();
  if (!v) return required ? "Contact number is required" : null;
  if (!PHONE_CHARS_RE.test(v))
    return "Use digits only (with an optional leading +)";
  const digits = v.replace(/\D/g, "").length;
  if (digits < 7 || digits > 15) return "Enter 7–15 digits";
  return null;
}

function urlError(value) {
  const v = str(value).trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:"
      ? null
      : "Must start with http:// or https://";
  } catch {
    return "Enter a full link, e.g. https://maps.google.com/…";
  }
}

function maxLen(errors, key, value, max) {
  if (str(value).trim().length > max)
    errors[key] = `Keep this under ${max} characters`;
}

const MB = 1024 * 1024;

/**
 * Validates the whole enquiry form for both POST (create) and PUT (edit).
 * Returns { [fieldKey]: message } — empty object means valid. Keys:
 *   companyName, projects.0.projectName, projects.0.scope.1.quantity,
 *   siteVisit.siteVisitDate, attachments, …
 */
export function validateEnquiry(
  form,
  { mode = "create", files = [], maxFileMB = 0, maxRequestMB = 0 } = {},
) {
  const e = {};
  const today = todayLocal();

  // customer / client
  if (isBlank(form.companyName)) e.companyName = "Company name is required";
  else maxLen(e, "companyName", form.companyName, LIMITS.companyName);
  if (isBlank(form.contactPerson))
    e.contactPerson = "Contact person is required";
  else maxLen(e, "contactPerson", form.contactPerson, LIMITS.contactPerson);
  const phone = phoneError(form.contactNumber);
  if (phone) e.contactNumber = phone;
  if (!isBlank(form.customerEmail)) {
    if (!EMAIL_RE.test(str(form.customerEmail).trim()))
      e.customerEmail = "Enter a valid email address";
    else maxLen(e, "customerEmail", form.customerEmail, LIMITS.customerEmail);
  }

  // enquiry details
  if (isBlank(form.dateOfEnquiry)) e.dateOfEnquiry = "Enquiry date is required";
  else if (!isValidDate(form.dateOfEnquiry))
    e.dateOfEnquiry = "Enter a valid date";
  // future check only on create — an existing record shouldn't block unrelated edits
  else if (mode === "create" && form.dateOfEnquiry > today)
    e.dateOfEnquiry = "Enquiry date can't be in the future";

  if (!isBlank(form.submissionDeadline)) {
    if (!isValidDate(form.submissionDeadline))
      e.submissionDeadline = "Enter a valid date";
    else if (
      isValidDate(form.dateOfEnquiry) &&
      form.submissionDeadline < form.dateOfEnquiry
    )
      e.submissionDeadline = "Deadline can't be before the enquiry date";
  }
  maxLen(e, "projectReference", form.projectReference, LIMITS.projectReference);
  maxLen(e, "projectLead", form.projectLead, LIMITS.projectLead);
  maxLen(e, "remarks", form.remarks, LIMITS.remarks);

  if (isBlank(form.projectStatus)) {
    if (mode === "create") e.projectStatus = "Project status is required";
  } else if (!PROJECT_STATUS_VALUES.includes(form.projectStatus))
    e.projectStatus = "Pick a valid project status";

  if (isBlank(form.currentStatus)) {
    if (mode === "create") e.currentStatus = "Current status is required";
  } else if (!STATUS_VALUES.includes(form.currentStatus))
    e.currentStatus = "Pick a valid status";

  // projects + scope of services
  const projects = form.projectInformations ?? [];
  if (projects.length === 0) e.projects = "Add at least one project";
  projects.forEach((p, i) => {
    const k = `projects.${i}`;
    if (isBlank(p.projectName))
      e[`${k}.projectName`] = "Project name is required";
    else maxLen(e, `${k}.projectName`, p.projectName, LIMITS.projectName);
    if (isBlank(p.country)) e[`${k}.country`] = "Country is required";
    if (isUae(p.country) && isBlank(p.emirate))
      e[`${k}.emirate`] = "Emirate is required for UAE projects";

    const scopes = p.scopeOfServices ?? [];
    if (scopes.length === 0) e[`${k}.scope`] = "Add at least one activity";
    scopes.forEach((s, j) => {
      const sk = `${k}.scope.${j}`;
      if (isBlank(s.activityId)) e[`${sk}.activityId`] = "Select an activity";
      if (isBlank(s.unit)) e[`${sk}.unit`] = "Select a unit";
      const q = Number(s.quantity);
      if (isBlank(s.quantity)) e[`${sk}.quantity`] = "Quantity is required";
      else if (!Number.isFinite(q) || q <= 0)
        e[`${sk}.quantity`] = "Quantity must be greater than 0";
      else if (q > 1_000_000_000) e[`${sk}.quantity`] = "Quantity is too large";
      if (str(s.remarks).trim().length > LIMITS.scopeRemarks)
        e[`${sk}.remarks`] =
          `Keep remarks under ${LIMITS.scopeRemarks} characters`;
    });
  });

  // site visit — only validated when it's required
  const sv = form.siteVisit ?? {};
  if (sv.siteVisitRequired) {
    if (isBlank(sv.siteVisitAssignedTo))
      e["siteVisit.siteVisitAssignedTo"] = "Assign the site visit to someone";
    else
      maxLen(
        e,
        "siteVisit.siteVisitAssignedTo",
        sv.siteVisitAssignedTo,
        LIMITS.siteVisitAssignedTo,
      );
    if (isBlank(sv.siteVisitDate))
      e["siteVisit.siteVisitDate"] = "Site visit date & time is required";
    else if (!isValidDateTime(sv.siteVisitDate))
      e["siteVisit.siteVisitDate"] = "Enter a valid date & time";
    else if (mode === "create" && sv.siteVisitDate.slice(0, 10) < today)
      e["siteVisit.siteVisitDate"] =
        "Site visit can't be scheduled in the past";
    if (isBlank(sv.contactPerson))
      e["siteVisit.contactPerson"] = "Site contact person is required";
    else
      maxLen(
        e,
        "siteVisit.contactPerson",
        sv.contactPerson,
        LIMITS.contactPerson,
      );
    const svPhone = phoneError(sv.contactNumber, { required: true });
    if (svPhone) e["siteVisit.contactNumber"] = svPhone;
    const link = urlError(sv.googleMapLink);
    if (link) e["siteVisit.googleMapLink"] = link;
    else
      maxLen(
        e,
        "siteVisit.googleMapLink",
        sv.googleMapLink,
        LIMITS.googleMapLink,
      );
  }

  // uploads — catches oversized files here instead of a server 413
  const realFiles = files.map((f) => f.file).filter(Boolean);
  if (maxFileMB) {
    const big = realFiles.filter((f) => f.size > maxFileMB * MB);
    if (big.length)
      e.attachments = `${big.map((f) => f.name).join(", ")} ${big.length > 1 ? "are" : "is"} over the ${maxFileMB} MB per-file limit`;
  }
  if (!e.attachments && maxRequestMB) {
    const total = realFiles.reduce((s, f) => s + f.size, 0);
    if (total > maxRequestMB * MB)
      e.attachments = `Attachments total ${(total / MB).toFixed(1)} MB — the limit is ${maxRequestMB} MB per enquiry`;
  }

  return e;
}

// ---- edit diff ------------------------------------------------------------
// PUT /api/enquiry/{id} is a partial update: send only what changed, and for
// nested rows send the row's `id` plus just its changed fields, e.g.
//   projectInformations[0].id = 119
//   projectInformations[0].projectName = DXB EXP123
// Rows without an id are new and are sent in full.

const t = (v) => str(v).trim();
const num = (v) =>
  v === "" || v === null || v === undefined ? "" : String(Number(v));

const EDIT_SCALAR_KEYS = [
  "companyName",
  "customerEmail",
  "contactPerson",
  "contactNumber",
  "projectReference",
  "projectLead",
  "remarks",
  "dateOfEnquiry",
  "submissionDeadline",
  "currentStatus",
  "projectStatus",
];
const PROJECT_KEYS = ["projectName", "country", "emirate"];
const SCOPE_KEYS = ["activityId", "unit", "quantity", "remarks"];
const SV_KEYS = [
  "siteVisitAssignedTo",
  "siteVisitDate",
  "contactPerson",
  "contactNumber",
  "googleMapLink",
];

const sameScopeValue = (key, a, b) =>
  key === "quantity" ? num(a) === num(b) : t(a) === t(b);
const sameProjectValue = (key, a, b) =>
  key === "country"
    ? (isUae(a) ? UAE : t(a)) === (isUae(b) ? UAE : t(b))
    : t(a) === t(b);

const fullScope = (s) => ({
  activityId: s.activityId,
  unit: s.unit,
  quantity: s.quantity,
  remarks: s.remarks,
});
const fullProject = (p) => ({
  projectName: p.projectName,
  country: p.country,
  emirate: p.emirate,
  scopeOfServices: (p.scopeOfServices ?? []).map(fullScope),
});

function diffSiteVisit(orig = {}, next = {}) {
  const wasOn = Boolean(orig.siteVisitRequired);
  const isOn = Boolean(next.siteVisitRequired);
  if (!wasOn && !isOn) return null;
  if (wasOn && !isOn)
    return { siteVisitRequired: false, gatePassRequired: false };
  if (!wasOn && isOn) {
    const out = {
      siteVisitRequired: true,
      gatePassRequired: Boolean(next.gatePassRequired),
    };
    for (const k of SV_KEYS) if (t(next[k])) out[k] = next[k];
    return out;
  }
  const out = {};
  if (Boolean(orig.gatePassRequired) !== Boolean(next.gatePassRequired))
    out.gatePassRequired = Boolean(next.gatePassRequired);
  for (const k of SV_KEYS) if (t(orig[k]) !== t(next[k])) out[k] = next[k];
  return Object.keys(out).length ? out : null;
}

/**
 * Returns { changes, unidentified }. `changes` is the partial payload for the
 * PUT. `unidentified` lists saved scope rows that were edited but have no id
 * (the backend didn't return one) — those can't be updated safely.
 */
export function diffEnquiry(original, form) {
  const changes = {};
  const unidentified = [];

  for (const key of EDIT_SCALAR_KEYS) {
    if (t(form[key]) !== t(original[key])) changes[key] = form[key];
  }

  const sv = diffSiteVisit(original.siteVisit, form.siteVisit);
  if (sv) changes.siteVisit = sv;

  const projects = [];
  (form.projectInformations ?? []).forEach((p, pi) => {
    const orig =
      p.id != null
        ? (original.projectInformations ?? []).find((op) => op.id === p.id)
        : null;
    if (!orig) {
      projects.push(fullProject(p)); // new project
      return;
    }
    const row = {};
    for (const k of PROJECT_KEYS)
      if (!sameProjectValue(k, orig[k], p[k])) row[k] = p[k];

    const scopes = [];
    (p.scopeOfServices ?? []).forEach((s, si) => {
      const os = s._saved ? orig.scopeOfServices?.[s._origIndex] : null;
      if (!os) {
        scopes.push(fullScope(s)); // new scope row
        return;
      }
      const sc = {};
      for (const k of SCOPE_KEYS)
        if (!sameScopeValue(k, os[k], s[k])) sc[k] = s[k];
      if (!Object.keys(sc).length) return;
      if (s.id == null)
        unidentified.push(`Project ${pi + 1}, activity row ${si + 1}`);
      else scopes.push({ id: s.id, ...sc });
    });

    if (scopes.length) row.scopeOfServices = scopes;
    if (Object.keys(row).length) projects.push({ id: p.id, ...row });
  });
  if (projects.length) changes.projectInformations = projects;

  return { changes, unidentified };
}

// ---- new enquiry for an existing customer -------------------------------------

/**
 * Starting form for "Existing customer": only the customer details are taken
 * from the picked enquiry (company is locked; contact, number and email stay
 * editable). Everything else — dates, status, projects, site visit, files —
 * is entered fresh, exactly like a new enquiry.
 */
export function formFromExistingCustomer(record) {
  return {
    ...emptyEnquiry(),
    companyName: str(record?.companyName),
    contactPerson: str(record?.contactPerson) || str(record?.customerName),
    contactNumber: str(record?.contactNumber),
    customerEmail: str(record?.customerEmail),
  };
}
