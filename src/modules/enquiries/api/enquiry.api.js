import { axiosInstance } from "../../../shared/api/axiosInstance";

// ---- shared field handling for POST /save and PUT /{id} ------------------------

const trim = (v) => (typeof v === "string" ? v.trim() : v);
const hasValue = (v) =>
  v !== undefined && v !== null && String(v).trim() !== "";

// CRM_APIS.pdf sends "NO_LEAD" when no lead is chosen; the form shows "No Lead".
const leadValue = (v) =>
  !hasValue(v) || trim(v) === "No Lead" ? "NO_LEAD" : trim(v);

// Free-text fields (sent trimmed). On create, blanks are skipped; on update,
// blanks are sent so a field can be cleared.
const TEXT_KEYS = [
  "companyName",
  "customerName",
  "customerEmail",
  "contactPerson",
  "contactNumber",
  "projectReference",
  "remarks",
];
// Enum/date fields — never sent empty (an empty string fails Spring's binding).
const VALUE_KEYS = [
  "dateOfEnquiry",
  "currentStatus",
  "projectStatus",
  "submissionDeadline",
];
const SITE_VISIT_KEYS = [
  "siteVisitAssignedTo",
  "siteVisitDate",
  "contactPerson",
  "contactNumber",
  "googleMapLink",
];

function appendSiteVisit(fd, sv, { sendWhenOff }) {
  if (!sv) return;
  if (!sv.siteVisitRequired && !sendWhenOff) return;
  fd.append(
    "siteVisit.siteVisitRequired",
    String(Boolean(sv.siteVisitRequired)),
  );
  fd.append(
    "siteVisit.gatePassRequired",
    String(Boolean(sv.siteVisitRequired && sv.gatePassRequired)),
  );
  if (!sv.siteVisitRequired) return;
  for (const key of SITE_VISIT_KEYS) {
    if (hasValue(sv[key])) fd.append(`siteVisit.${key}`, trim(sv[key]));
  }
}

function appendProjects(fd, projects, { withIds }) {
  projects.forEach((project, i) => {
    const base = `projectInformations[${i}]`;
    if (withIds && hasValue(project.id)) fd.append(`${base}.id`, project.id);
    fd.append(`${base}.projectName`, trim(project.projectName ?? ""));
    fd.append(`${base}.country`, trim(project.country ?? ""));
    fd.append(`${base}.emirate`, trim(project.emirate ?? ""));
    (project.scopeOfServices || []).forEach((scope, j) => {
      const sb = `${base}.scopeOfServices[${j}]`;
      if (withIds && hasValue(scope.id)) fd.append(`${sb}.id`, scope.id);
      if (hasValue(scope.activityId))
        fd.append(`${sb}.activityId`, scope.activityId);
      fd.append(`${sb}.unit`, trim(scope.unit ?? ""));
      fd.append(
        `${sb}.quantity`,
        hasValue(scope.quantity) ? Number(scope.quantity) : "",
      );
      fd.append(`${sb}.remarks`, trim(scope.remarks ?? ""));
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
  if (hasValue(enquiry.selectedEnquiryId))
    fd.append("selectedEnquiryId", enquiry.selectedEnquiryId);

  for (const key of TEXT_KEYS) {
    if (hasValue(enquiry[key])) fd.append(key, trim(enquiry[key]));
  }
  fd.append("projectLead", leadValue(enquiry.projectLead));
  for (const key of VALUE_KEYS) {
    if (hasValue(enquiry[key])) fd.append(key, trim(enquiry[key]));
  }

  appendSiteVisit(fd, enquiry.siteVisit, { sendWhenOff: false });
  appendProjects(fd, enquiry.projectInformations || [], { withIds: false });
  appendFiles(fd, enquiry.attachments);
  return fd;
}

/**
 * multipart/form-data for PUT /api/enquiry/{id}. Partial-update shaped: keys
 * that are undefined aren't sent, so callers can send just { currentStatus }
 * or the whole edited record. Existing project/scope rows carry their `id`.
 */
export function buildEnquiryUpdateFormData(enquiry) {
  const fd = new FormData();

  for (const key of TEXT_KEYS) {
    if (enquiry[key] !== undefined && enquiry[key] !== null)
      fd.append(key, trim(enquiry[key]));
  }
  if (enquiry.projectLead !== undefined)
    fd.append("projectLead", leadValue(enquiry.projectLead));
  for (const key of VALUE_KEYS) {
    if (hasValue(enquiry[key])) fd.append(key, trim(enquiry[key]));
  }

  // sent when present — including required=false, which switches an existing site visit off
  appendSiteVisit(fd, enquiry.siteVisit, { sendWhenOff: true });
  if (Array.isArray(enquiry.projectInformations))
    appendProjects(fd, enquiry.projectInformations, { withIds: true });
  appendFiles(fd, enquiry.attachments);
  return fd;
}

export const enquiryApi = {
  save(enquiry) {
    return axiosInstance.post(
      "/api/enquiry/save",
      buildEnquiryFormData(enquiry),
    );
  },
  searchExisting({ companyName = "", projectName = "" }) {
    return axiosInstance.post("/api/enquiry/search-existing", {
      companyName,
      projectName,
    });
  },
  getById(id) {
    return axiosInstance.get(`/api/enquiry/${id}`);
  },
  getAll({ page = 0, size = 20 } = {}) {
    return axiosInstance.get("/api/enquiry", { params: { page, size } });
  },
  update(id, enquiry) {
    return axiosInstance.put(
      `/api/enquiry/${id}`,
      buildEnquiryUpdateFormData(enquiry),
    );
  },
  remove(id) {
    return axiosInstance.delete(`/api/enquiry/${id}`);
  },
};
