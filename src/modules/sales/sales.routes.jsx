import { Route } from "react-router-dom";
import InternalRequestsPage from "./internal-requests/pages/InternalRequestsPage";
import SiteVisitRequestPage from "./internal-requests/pages/SiteVisitRequestPage";
import QuotationListPage from "./quotations/pages/QuotationListPage";
import EnquiryQuotationPage from "./quotations/pages/EnquiryQuotationPage";
import QuotationDetailsPage from "./quotations/pages/QuotationDetailsPage";
import EditQuotationPage from "./quotations/pages/EditQuotationPage";
import FollowUpListPage from "./follow-ups/pages/FollowUpListPage";

// orders/ and direct-sales/ are real sub-feature folders with no screens yet —
// they fall through to the generic /coming-soon/:label route in app/router.jsx.
export const salesRoutes = (
  <>
    <Route path="requests" element={<InternalRequestsPage />} />
    <Route path="requests/:id" element={<SiteVisitRequestPage />} />

    <Route path="quotations" element={<QuotationListPage />} />
    <Route path="quotations/:id" element={<QuotationDetailsPage />} />
    <Route path="quotations/:id/edit" element={<EditQuotationPage />} />
    <Route path="enquiries/:id/quotation" element={<EnquiryQuotationPage />} />

    <Route path="follow-ups" element={<FollowUpListPage />} />
  </>
);
