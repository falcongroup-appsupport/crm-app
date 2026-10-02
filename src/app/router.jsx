import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute, authRoutes } from "../modules/auth";
import { homeRoutes } from "../modules/home";
import { dashboardRoutes } from "../modules/dashboard";
import { enquiryRoutes } from "../modules/enquiries";
import { salesRoutes } from "../modules/sales";
import { mastersRoutes } from "../modules/masters";
import ComingSoonPage from "../pages/ComingSoonPage";
import NotFoundPage from "../pages/NotFoundPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>{authRoutes}</Route>

      {/* ProtectedRoute is a pass-through today (see modules/auth/guards) —
          every route below is reachable without signing in until the
          backend has a real auth endpoint. */}
      <Route element={<ProtectedRoute />}>
        {/* Landing page: full screen, no sidebar. Per-module sign-in can wrap
            each module's routes later without touching this page. */}
        {homeRoutes}

        <Route element={<DashboardLayout />}>
          {dashboardRoutes}
          {enquiryRoutes}
          {salesRoutes}
          {mastersRoutes}

          {/* project-management, planning-management, site-management, and
              the remaining masters/sales sub-features have no screens yet —
              every nav item for them points here. */}
          <Route path="coming-soon/:label" element={<ComingSoonPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
