import { axiosInstance } from "../../../../shared/api/axiosInstance";

export const quotationApi = {
  /** All quotations (GET /api/quotation returns a plain array). */
  getAll() {
    return axiosInstance.get("/api/quotation");
  },
  create(body) {
    return axiosInstance.post("/api/quotation", body);
  },
  getById(id) {
    return axiosInstance.get(`/api/quotation/${id}`);
  },
  /** Quotations raised against one enquiry — an enquiry can have several. */
  getByEnquiry(enquiryId) {
    return axiosInstance.get(`/api/quotation/enquiry/${enquiryId}`);
  },
  update(id, body) {
    return axiosInstance.put(`/api/quotation/${id}`, body);
  },
};
