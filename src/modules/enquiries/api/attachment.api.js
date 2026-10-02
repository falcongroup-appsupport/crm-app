import { axiosInstance } from "../../../shared/api/axiosInstance";

export const attachmentApi = {
  /** Files are fetched through axios (not a plain link) so the auth header applies once login exists. */
  fetchBlob(filePath) {
    return axiosInstance.get(filePath, { responseType: "blob" });
  },
  // Not documented yet — DELETE /api/attachments/{id} is assumed. Confirm the
  // real endpoint with the backend; this is the only place to change it.
  remove(id) {
    return axiosInstance.delete(`/api/attachments/${id}`);
  },
};
