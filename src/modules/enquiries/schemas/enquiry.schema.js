// Lightweight default-shape "schema" for the enquiry form — no validation
// library in use yet, just the canonical empty shapes the form starts from.
import { ENQUIRY_SOURCES } from "../constants/enquiryStatus";

export const emptyProject = () => ({
  projectName: "",
  country: "United Arab Emirates",
  emirate: "Dubai",
  scopeOfServices: [{ activityId: "", unit: "LS", quantity: 1, remarks: "" }],
});

export const emptyEnquiry = () => ({
  enquiryType: "NEW",
  dateOfEnquiry: new Date().toISOString().slice(0, 10),
  companyName: "",
  customerName: "",
  customerEmail: "",
  contactPerson: "",
  contactNumber: "",
  projectReference: "",
  projectLead: "No Lead",
  currentStatus: "SELECT",
  projectStatus: "JOB_IN_HAND",
  remarks: "",
  submissionDeadline: "",
  source: ENQUIRY_SOURCES[0],
  siteVisit: { siteVisitRequired: false, gatePassRequired: false },
  projectInformations: [emptyProject()],
  attachments: [],
});
