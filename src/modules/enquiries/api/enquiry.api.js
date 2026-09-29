import { axiosInstance } from "../../../shared/api/axiosInstance";

/**
 * Builds the multipart/form-data body the backend expects for
 * POST /api/enquiry/save, including bracketed array keys for
 * projectInformations[i].scopeOfServices[j].* and dotted siteVisit.* keys.
 * Field list matches CRM_APIS.pdf exactly.
 */
export function buildEnquiryFormData(enquiry) {
  const fd = new FormData();

  const scalarKeys = [
    "enquiryType",
    "selectedEnquiryId",
    "dateOfEnquiry",
    "companyName",
    "customerName",
    "customerEmail",
    "contactPerson",
    "contactNumber",
    "projectReference",
    "projectLead",
    "currentStatus",
    "projectStatus",
    "remarks",
  ];
  for (const key of scalarKeys) {
    if (enquiry[key] !== undefined && enquiry[key] !== null && enquiry[key] !== "") {
      fd.append(key, enquiry[key]);
    }
  }

  // Not in the documented field list, but the GET response includes
  // submissionDeadline — sending it under that name until confirmed.
  if (enquiry.submissionDeadline) {
    fd.append("submissionDeadline", enquiry.submissionDeadline);
  }

  const sv = enquiry.siteVisit || {};
  if (sv.siteVisitRequired) {
    fd.append("siteVisit.siteVisitRequired", "true");
    fd.append("siteVisit.gatePassRequired", String(Boolean(sv.gatePassRequired)));
    for (const key of ["siteVisitAssignedTo", "siteVisitDate", "contactPerson", "contactNumber", "googleMapLink"]) {
      if (sv[key]) fd.append(`siteVisit.${key}`, sv[key]);
    }
  }

  (enquiry.projectInformations || []).forEach((project, i) => {
    fd.append(`projectInformations[${i}].projectName`, project.projectName || "");
    fd.append(`projectInformations[${i}].country`, project.country || "");
    fd.append(`projectInformations[${i}].emirate`, project.emirate || "");
    (project.scopeOfServices || []).forEach((scope, j) => {
      fd.append(`projectInformations[${i}].scopeOfServices[${j}].activityId`, scope.activityId ?? "");
      fd.append(`projectInformations[${i}].scopeOfServices[${j}].unit`, scope.unit || "");
      fd.append(`projectInformations[${i}].scopeOfServices[${j}].quantity`, scope.quantity ?? "");
      fd.append(`projectInformations[${i}].scopeOfServices[${j}].remarks`, scope.remarks || "");
    });
  });

  (enquiry.attachments || []).forEach((att) => {
    if (att.file) {
      fd.append("files", att.file, att.file.name);
      fd.append("fileTypes", att.fileType || "OTHER");
    }
  });

  return fd;
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
    return axiosInstance.put(`/api/enquiry/${id}`, buildEnquiryFormData(enquiry));
  },
  remove(id) {
    return axiosInstance.delete(`/api/enquiry/${id}`);
  },
};
