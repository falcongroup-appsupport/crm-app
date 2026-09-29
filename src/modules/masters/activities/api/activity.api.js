import { axiosInstance } from "../../../../shared/api/axiosInstance";

// Only POST /api/activity is documented so far. GET /api/activity is assumed
// (standard REST convention) for populating the Scope of Services dropdown —
// confirm the path once available.
export const activityApi = {
  create({ activityName, active = true }) {
    return axiosInstance.post("/api/activity", { activityName, active });
  },
  getAll() {
    return axiosInstance.get("/api/activity");
  },
};
