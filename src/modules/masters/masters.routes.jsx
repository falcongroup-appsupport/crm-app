import { Route } from "react-router-dom";
import ActivityMasterPage from "./activities/pages/ActivityMasterPage";
import QuotationTemplatesPage from "./quotation-templates/pages/QuotationTemplatesPage";

// customers/, uom/, resources/, survey-reports/, benchmarks/, projects/ have no
// screens yet — they fall through to the generic /coming-soon/:label route.
export const mastersRoutes = (
  <>
    <Route path="activities" element={<ActivityMasterPage />} />
    <Route path="quotation-templates" element={<QuotationTemplatesPage />} />
  </>
);
