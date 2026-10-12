import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Loader } from "../../../../shared/components/feedback/Loader";
import { useEnquiry } from "../../../enquiries/hooks/useEnquiry";
import { QuotationForm } from "../components/QuotationForm";

/** /quotations/new?enquiryId=5 — new quotation pre-filled from the enquiry. */
export default function CreateQuotationPage() {
  const [params] = useSearchParams();
  const enquiryId = params.get("enquiryId");
  const { enquiry, loading, error } = useEnquiry(enquiryId, {
    enabled: Boolean(enquiryId),
  });

  if (!enquiryId) return <Navigate to="/quotations?tab=awaiting" replace />;
  if (loading) return <Loader label="Loading enquiry…" />;
  if (error || !enquiry) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-8">
        <p className="rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
          {error || "Enquiry not found."}
        </p>
        <Link
          to="/quotations?tab=awaiting"
          className="text-sm font-medium text-signal-600 hover:text-signal-700"
        >
          Pick another enquiry
        </Link>
      </div>
    );
  }
  return <QuotationForm key={enquiry.id} mode="create" enquiry={enquiry} />;
}
