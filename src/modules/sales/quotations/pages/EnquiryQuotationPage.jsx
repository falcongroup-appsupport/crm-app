import { Link, useParams } from "react-router-dom";
import { Loader } from "../../../../shared/components/feedback/Loader";
import { useEnquiry } from "../../../enquiries/hooks/useEnquiry";
import { useEnquiryQuotation } from "../hooks/useEnquiryQuotation";
import { QuotationForm } from "../components/QuotationForm";
import { QuotationView } from "../components/QuotationView";

/** /enquiries/:id/quotation — shows the enquiry's quotation, or the create form if it has none. */
export default function EnquiryQuotationPage() {
  const { id } = useParams();
  const { quotation, loading, error, notFound } = useEnquiryQuotation(id);
  const {
    enquiry,
    loading: enquiryLoading,
    error: enquiryError,
  } = useEnquiry(id, { enabled: true });

  if (loading || enquiryLoading) return <Loader label="Loading quotation…" />;

  const problem = error || (notFound && enquiryError);
  if (problem) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-8">
        <p className="rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
          {problem}
        </p>
        <Link
          to="/quotations"
          className="text-sm font-medium text-signal-600 hover:text-signal-700"
        >
          Back to quotations
        </Link>
      </div>
    );
  }

  if (quotation) return <QuotationView quotation={quotation} />;
  return <QuotationForm mode="create" enquiry={enquiry} />;
}
