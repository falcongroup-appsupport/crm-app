import { axiosInstance } from "../../../../shared/api/axiosInstance";

export const paymentTermApi = {
  getActive() {
    return axiosInstance.get("/api/payment-terms");
  },
  getById(id) {
    return axiosInstance.get(`/api/payment-terms/${id}`);
  },
  getAll() {
    return axiosInstance.get("/api/payment-terms/getall");
  },
};
