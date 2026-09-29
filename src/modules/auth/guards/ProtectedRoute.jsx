import { Outlet } from "react-router-dom";

/**
 * Wire this up once /api/auth exists:
 *
 *   import { Navigate } from "react-router-dom";
 *   import { useAuth } from "../hooks/useAuth";
 *
 *   export function ProtectedRoute() {
 *     const { isAuthenticated } = useAuth();
 *     return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
 *   }
 *
 * For now it lets everyone through so the app stays usable without a login step.
 */
export function ProtectedRoute() {
  return <Outlet />;
}
