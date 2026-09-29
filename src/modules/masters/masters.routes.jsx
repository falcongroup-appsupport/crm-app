import { Route } from "react-router-dom";
import ActivityMasterPage from "./activities/pages/ActivityMasterPage";

// customers/, uom/, resources/, quotations/, survey-reports/, benchmarks/,
// projects/ are real sub-feature folders with no screens yet — they fall
// through to the generic /coming-soon/:label route in app/router.jsx.
export const mastersRoutes = <Route path="activities" element={<ActivityMasterPage />} />;
