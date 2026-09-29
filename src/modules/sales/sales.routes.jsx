import { Route } from "react-router-dom";
import InternalRequestsPage from "./internal-requests/pages/InternalRequestsPage";
import SiteVisitRequestPage from "./internal-requests/pages/SiteVisitRequestPage";

// quotations/, orders/, direct-sales/, follow-ups/ are real sub-feature
// folders under modules/sales/ with no screens yet — they fall through to
// the single generic /coming-soon/:label route registered in app/router.jsx,
// same as every other unbuilt nav item.
export const salesRoutes = (
  <>
    <Route path="requests" element={<InternalRequestsPage />} />
    <Route path="requests/:id" element={<SiteVisitRequestPage />} />
  </>
);
