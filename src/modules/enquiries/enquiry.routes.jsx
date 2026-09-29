import { Route } from "react-router-dom";
import EnquiryListPage from "./pages/EnquiryListPage";
import AddEnquiryPage from "./pages/AddEnquiryPage";
import EditEnquiryPage from "./pages/EditEnquiryPage";
import EnquiryDetailsPage from "./pages/EnquiryDetailsPage";

export const enquiryRoutes = (
  <>
    <Route path="enquiries" element={<EnquiryListPage />} />
    <Route path="enquiries/new" element={<AddEnquiryPage />} />
    <Route path="enquiries/:id" element={<EnquiryDetailsPage />} />
    <Route path="enquiries/:id/edit" element={<EditEnquiryPage />} />
  </>
);
