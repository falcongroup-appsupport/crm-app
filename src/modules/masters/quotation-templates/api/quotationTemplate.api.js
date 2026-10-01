import { axiosInstance } from "../../../../shared/api/axiosInstance";

function toFormData({ name, file }) {
  const fd = new FormData();
  fd.append("name", name);
  if (file) fd.append("file", file, file.name);
  return fd;
}

export const quotationTemplateApi = {
  create(data) {
    return axiosInstance.post("/api/quotation-templates", toFormData(data));
  },
  getById(id) {
    return axiosInstance.get(`/api/quotation-templates/${id}`);
  },
  getAll({ page = 0, size = 20 } = {}) {
    return axiosInstance.get("/api/quotation-templates", { params: { page, size } });
  },
  getActive({ page = 0, size = 20 } = {}) {
    return axiosInstance.get("/api/quotation-templates/active", { params: { page, size } });
  },
  update(id, data) {
    return axiosInstance.put(`/api/quotation-templates/${id}`, toFormData(data));
  },
  remove(id) {
    return axiosInstance.delete(`/api/quotation-templates/${id}`);
  },
};
