import { API_BASE_URL, axiosInstance } from "../../../../shared/api/axiosInstance";

function toFormData({ name, file }) {
  const fd = new FormData();
  fd.append("name", name);
  if (file) fd.append("file", file, file.name);
  return fd;
}

/** "uploads/quotation-templates/<uuid>_1. TOPO.docx" → path with each segment URL-encoded. */
const encodePath = (p) =>
  String(p ?? "")
    .replace(/^\/+/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");

/** Original file name: the stored name minus the folder and the "<uuid>_" prefix. */
export function templateFileName(t) {
  const base =
    String(t?.filePath ?? "")
      .split("/")
      .pop() ?? "";
  return base.replace(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i,
    "",
  );
}

/** "docx" | "pdf" | … (lower-case extension of the stored file). */
export const templateFileExt = (t) =>
  (templateFileName(t).split(".").pop() ?? "").toLowerCase();

/** Only Word files can be loaded into the quotation editor. */
export const isWordTemplate = (t) => templateFileExt(t) === "docx";

/** Absolute URL of the stored file — GET {API}/{filePath}. */
export const templateFileUrl = (t) =>
  t?.filePath ? `${API_BASE_URL.replace(/\/+$/, "")}/${encodePath(t.filePath)}` : null;

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
    return axiosInstance.get("/api/quotation-templates/active", {
      params: { page, size },
    });
  },
  update(id, data) {
    return axiosInstance.put(`/api/quotation-templates/${id}`, toFormData(data));
  },
  remove(id) {
    return axiosInstance.delete(`/api/quotation-templates/${id}`);
  },
  /** The template's file as a Blob (through axios, so the auth header applies once login exists). */
  fetchFile(template) {
    if (!template?.filePath)
      return Promise.reject(new Error("This template has no file."));
    return axiosInstance.get(`/${encodePath(template.filePath)}`, {
      responseType: "blob",
    });
  },
};
