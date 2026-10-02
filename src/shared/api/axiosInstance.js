import axios from "axios";

// Base URL comes from VITE_API_BASE_URL (see .env). Point this at whichever
// machine is running the Spring Boot backend from CRM_APIS.pdf.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

const TOKEN_STORAGE_KEY = "survey-crm.auth-token";

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // storage may be unavailable — token still applies for this session via the interceptor
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// The single axios instance every module's api file is built on. This is
// also where JWT auth and RBAC will live once the backend has them:
// - auth: the request interceptor below already attaches "Authorization:
//   Bearer <token>" whenever setAuthToken() has stored one (see
//   modules/auth/context/AuthContext.jsx). Nothing calls it yet.
// - RBAC: per the pattern used on Falcon Monitoring, role/department/company
//   scope comes from claims inside the JWT itself (no separate role header) —
//   once real tokens exist, decode the claims here (or in AuthContext) and
//   expose them through useAuth() for PermissionGuard to check.
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (axios.isCancel(err)) {
      throw new ApiError("Request cancelled", 0);
    }
    if (err.code === "ECONNABORTED") {
      throw new ApiError(`Timed out reaching ${API_BASE_URL}`, 0);
    }
    if (err.response) {
      // 401 handling belongs here once auth is real: clear the token
      // (setAuthToken(null)) and let the app redirect to /login.
      if (err.response.status === 401) {
        setAuthToken(null);
      }
      if (err.response.status === 413) {
        throw new ApiError(
          "The server rejected the request as too large (HTTP 413). For multipart requests this is either the upload size limit (spring.servlet.multipart.max-file-size / max-request-size, nginx client_max_body_size) or the limit on the number of form fields per request (server.tomcat.max-part-count).",
          413,
        );
      }
      const data = err.response.data;
      const detail =
        (typeof data === "string" && data) ||
        data?.message ||
        data?.detail ||
        data?.error ||
        `Request failed (${err.response.status})`;
      throw new ApiError(detail, err.response.status);
    }
    throw new ApiError(
      `Could not reach API at ${API_BASE_URL} — is the backend running?`,
      0,
    );
  },
);
