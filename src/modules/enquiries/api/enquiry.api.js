import { axiosInstance } from "../../../shared/api/axiosInstance";

// ---- shared field handling for POST /save and PUT /{id} ------------------------

const trim = (v) => (typeof v === "string" ? v.trim() : v);
const hasValue = (v) => v !== undefined && v !== null && String(v).trim() !== "";

// CRM_APIS.pdf sends "NO_LEAD" when no lead is chosen; the form shows "No Lead".
const leadValue = (v) => (!hasValue(v) || trim(v) === "No Lead" ? "NO_LEAD" : trim(v));

// Free-text fields (sent trimmed). On create, blanks are skipped; on update,
// blanks are sent so a field can be cleared.
const TEXT_KEYS = ["companyName", "customerName", "customerEmail", "contactPerson", "contactNumber", "projectReference", "remarks"];
// Enum/date fields — never sent empty (an empty string fails Spring's binding).
const VALUE_KEYS = ["dateOfEnquiry", "currentStatus", "projectStatus", "submissionDeadline"];
const SITE_VISIT_KEYS = ["siteVisitAssignedTo", "siteVisitDate", "contactPerson", "contactNumber", "googleMapLink"];

function appendSiteVisit(fd, sv) {
  if (!sv?.siteVisitRequired) return;
  fd.append("siteVisit.siteVisitRequired", String(Boolean(sv.siteVisitRequired)));
  fd.append("siteVisit.gatePassRequired", String(Boolean(sv.siteVisitRequired && sv.gatePassRequired)));
  for (const key of SITE_VISIT_KEYS) {
    if (hasValue(sv[key])) fd.append(`siteVisit.${key}`, trim(sv[key]));
  }
}

// On create, empty optional values are skipped (fewer multipart parts);
// on update they're sent so an existing value can be cleared.
function appendProjects(fd, projects, { withIds }) {
  const optional = (key, value) => {
    if (withIds || hasValue(value)) fd.append(key, trim(value ?? ""));
  };
  projects.forEach((project, i) => {
    const base = `projectInformations[${i}]`;
    if (withIds && hasValue(project.id)) fd.append(`${base}.id`, project.id);
    fd.append(`${base}.projectName`, trim(project.projectName ?? ""));
    fd.append(`${base}.country`, trim(project.country ?? ""));
    optional(`${base}.emirate`, project.emirate);
    (project.scopeOfServices || []).forEach((scope, j) => {
      const sb = `${base}.scopeOfServices[${j}]`;
      if (withIds && hasValue(scope.id)) fd.append(`${sb}.id`, scope.id);
      if (hasValue(scope.activityId)) fd.append(`${sb}.activityId`, scope.activityId);
      fd.append(`${sb}.unit`, trim(scope.unit ?? ""));
      fd.append(`${sb}.quantity`, hasValue(scope.quantity) ? Number(scope.quantity) : "");
      optional(`${sb}.remarks`, scope.remarks);
    });
  });
}

function appendFiles(fd, attachments) {
  (attachments || []).forEach((att) => {
    if (att.file) {
      fd.append("files", att.file, att.file.name);
      fd.append("fileTypes", att.fileType || "OTHER");
    }
  });
}

/**
 * multipart/form-data for POST /api/enquiry/save — keys exactly as in
 * CRM_APIS.pdf (enquiryType, dateOfEnquiry, companyName, …, siteVisit.*,
 * projectInformations[i].scopeOfServices[j].*, files + fileTypes).
 * submissionDeadline isn't in the documented list but is in the GET response,
 * so it's sent under that name.
 */
export function buildEnquiryFormData(enquiry) {
  const fd = new FormData();
  fd.append("enquiryType", enquiry.enquiryType || "NEW");
  if (hasValue(enquiry.selectedEnquiryId)) fd.append("selectedEnquiryId", enquiry.selectedEnquiryId);

  for (const key of TEXT_KEYS) {
    if (hasValue(enquiry[key])) fd.append(key, trim(enquiry[key]));
  }
  fd.append("projectLead", leadValue(enquiry.projectLead));
  for (const key of VALUE_KEYS) {
    if (hasValue(enquiry[key])) fd.append(key, trim(enquiry[key]));
  }

  appendSiteVisit(fd, enquiry.siteVisit);
  appendProjects(fd, enquiry.projectInformations || [], { withIds: false });
  appendFiles(fd, enquiry.attachments);
  return fd;
}

/**
 * multipart/form-data for PUT /api/enquiry/{id} — a partial update. Only keys
 * present on the object are sent (see diffEnquiry). Nested rows carry their
 * `id` so the backend updates them in place, e.g.:
 *   projectInformations[0].id = 119
 *   projectInformations[0].projectName = DXB EXP123
 *   projectInformations[0].scopeOfServices[0].id = 47
 *   projectInformations[0].scopeOfServices[0].quantity = 10
 *   siteVisit.contactPerson = …
 * Rows without an id are new. Indexes are compact (0, 1, …) over the rows sent.
 */
export function buildEnquiryUpdateFormData(enquiry) {
  const fd = new FormData();
  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined;

  for (const key of TEXT_KEYS) {
    if (has(enquiry, key) && enquiry[key] !== null) fd.append(key, trim(enquiry[key]));
  }
  if (has(enquiry, "projectLead")) fd.append("projectLead", leadValue(enquiry.projectLead));
  for (const key of VALUE_KEYS) {
    if (hasValue(enquiry[key])) fd.append(key, trim(enquiry[key]));
  }

  const sv = enquiry.siteVisit;
  if (sv) {
    for (const key of ["siteVisitRequired", "gatePassRequired"]) {
      if (has(sv, key)) fd.append(`siteVisit.${key}`, String(Boolean(sv[key])));
    }
    for (const key of SITE_VISIT_KEYS) {
      if (!has(sv, key) || sv[key] === null) continue;
      if (key === "siteVisitDate" && !hasValue(sv[key])) continue; // empty date fails binding
      fd.append(`siteVisit.${key}`, trim(sv[key]));
    }
  }

  (enquiry.projectInformations || []).forEach((project, i) => {
    const base = `projectInformations[${i}]`;
    if (hasValue(project.id)) fd.append(`${base}.id`, project.id);
    for (const key of ["projectName", "country", "emirate"]) {
      if (has(project, key)) fd.append(`${base}.${key}`, trim(project[key] ?? ""));
    }
    (project.scopeOfServices || []).forEach((scope, j) => {
      const sb = `${base}.scopeOfServices[${j}]`;
      if (hasValue(scope.id)) fd.append(`${sb}.id`, scope.id);
      if (has(scope, "activityId") && hasValue(scope.activityId)) fd.append(`${sb}.activityId`, scope.activityId);
      if (has(scope, "unit")) fd.append(`${sb}.unit`, trim(scope.unit ?? ""));
      if (has(scope, "quantity")) fd.append(`${sb}.quantity`, hasValue(scope.quantity) ? Number(scope.quantity) : "");
      if (has(scope, "remarks")) fd.append(`${sb}.remarks`, trim(scope.remarks ?? ""));
    });
  });

  appendFiles(fd, enquiry.attachments);
  return fd;
}

/** Number of multipart parts a request will contain — used to explain HTTP 413s. */
export function countParts(formData) {
  let fields = 0;
  let files = 0;
  for (const [, v] of formData.entries()) {
    if (typeof v === "string") fields += 1;
    else files += 1;
  }
  return { fields, files, total: fields + files };
}

export const enquiryApi = {
  save(enquiry) {
    return axiosInstance.post("/api/enquiry/save", buildEnquiryFormData(enquiry));
  },
  searchExisting({ companyName = "", projectName = "" }) {
    return axiosInstance.post("/api/enquiry/search-existing", { companyName, projectName });
  },
  getById(id) {
    return axiosInstance.get(`/api/enquiry/${id}`);
  },
  getAll({ page = 0, size = 20 } = {}) {
    return axiosInstance.get("/api/enquiry", { params: { page, size } });
  },
  update(id, enquiry) {
    return axiosInstance.put(`/api/enquiry/${id}`, buildEnquiryUpdateFormData(enquiry));
  },
  remove(id) {
    return axiosInstance.delete(`/api/enquiry/${id}`);
  },
};
