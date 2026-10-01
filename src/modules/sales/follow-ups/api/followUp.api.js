import { axiosInstance } from "../../../../shared/api/axiosInstance";

export const followUpApi = {
  create(body) {
    return axiosInstance.post("/api/follow-feedback", body);
  },
  getById(id) {
    return axiosInstance.get(`/api/follow-feedback/${id}`);
  },
  getByQuotation(quotationId, { page = 0, size = 20 } = {}) {
    return axiosInstance.get(`/api/follow-feedback/quotation/${quotationId}`, { params: { page, size } });
  },
};
