import { axiosInstance } from "../../../../shared/api/axiosInstance";

// CRM_APIS.pdf lists "GET BY ID QUOTATION" as /api/enquiry/8, which looks like
// a copy-paste slip — /api/quotation/{id} is assumed. Confirm with the backend.
export const quotationApi = {
  create(body) {
    return axiosInstance.post("/api/quotation", body);
  },
  getById(id) {
    return axiosInstance.get(`/api/quotation/${id}`);
  },
  getByEnquiry(enquiryId) {
    return axiosInstance.get(`/api/quotation/enquiry/${enquiryId}`);
  },
  update(id, body) {
    return axiosInstance.put(`/api/quotation/${id}`, body);
  },
};
