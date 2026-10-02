import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { authApi } from "../api/auth.api";
import { getAuthToken, setAuthToken } from "../../../shared/api/axiosInstance";

const AuthContext = createContext(null);

/**
 * Scaffolding for when the backend gets real auth. Today:
 * - isAuthenticated is true whenever a token happens to be in storage (never, currently)
 * - login()/logout() work end-to-end against the axios instance's token interceptor
 * - nothing in the app actually calls login() yet, and no route is gated on this
 */
export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getAuthToken());
  const [user, setUser] = useState(null);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    setAuthToken(data?.token ?? null);
    setTokenState(data?.token ?? null);
    setUser(data?.user ?? null);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // backend logout may not exist yet — clear the local token regardless
    }
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, logout }),
    [token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
