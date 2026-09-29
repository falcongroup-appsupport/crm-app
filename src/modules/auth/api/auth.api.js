import { axiosInstance } from "../../../shared/api/axiosInstance";

// Not in CRM_APIS.pdf yet — path is a placeholder. Update once the backend
// exposes real auth endpoints; the shape (email/password in, token out) is
// a guess based on the most common Spring Security setup.
export const authApi = {
  login({ email, password }) {
    return axiosInstance.post("/api/auth/login", { email, password });
  },
  logout() {
    return axiosInstance.post("/api/auth/logout");
  },
};
