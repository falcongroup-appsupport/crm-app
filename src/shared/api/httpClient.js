import axios from "axios";

// Base URL comes from VITE_API_BASE_URL (see .env). Point this at whichever
// machine is running the Spring Boot backend from CRM_APIS.pdf.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

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
    // storage may be unavailable — token still applies for this session via the interceptor default below is skipped
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Attaches the bearer token once auth is added to the backend. No-op today
// since getAuthToken() returns null until something calls setAuthToken().
httpClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (axios.isCancel(err)) {
      throw new ApiError("Request cancelled", 0);
    }
    if (err.code === "ECONNABORTED") {
      throw new ApiError(`Timed out reaching ${API_BASE_URL}`, 0);
    }
    if (err.response) {
      // TODO: once the backend adds auth, a 401 here should clear the token
      // (setAuthToken(null)) and redirect to a login screen.
      const detail =
        (typeof err.response.data === "string" && err.response.data) ||
        err.response.data?.message ||
        `Request failed (${err.response.status})`;
      throw new ApiError(detail, err.response.status);
    }
    throw new ApiError(
      `Could not reach API at ${API_BASE_URL} — is the backend running?`,
      0,
    );
  },
);

/** Thin wrapper kept for call-site brevity: request("/api/x") / request("/api/x", { method: "post", data }) */
export function request(url, config = {}) {
  return httpClient.request({ url, ...config });
}
