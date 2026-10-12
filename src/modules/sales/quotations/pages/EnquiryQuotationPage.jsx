import { Link, Navigate, useParams } from "react-router-dom";
import { FilePlus2 } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";
import { Loader } from "../../../../shared/components/feedback/Loader";
import { useEnquiryQuotations } from "../hooks/useEnquiryQuotation";
import { QuotationTable } from "../components/QuotationTable";

/**
 * /enquiries/:id/quotation — the "Create sales quotation" entry point:
 * none → new quotation form · one → that quotation · several → pick one.
 */
export default function EnquiryQuotationPage() {
  const { id } = useParams();
  const { quotations, loading, error } = useEnquiryQuotations(id);

  if (loading) return <Loader label="Loading quotations…" />;
  if (error) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-8">
        <p className="rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
          {error}
        </p>
        <Link
          to={`/enquiries/${id}`}
          className="text-sm font-medium text-signal-600 hover:text-signal-700"
        >
          Back to the enquiry
        </Link>
      </div>
    );
  }
  if (quotations.length === 0)
    return <Navigate to={`/quotations/new?enquiryId=${id}`} replace />;
  if (quotations.length === 1)
    return <Navigate to={`/quotations/${quotations[0].id}`} replace />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-950 dark:text-white">
            Quotations for {quotations[0].enquiryNo ?? `enquiry #${id}`}
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            This enquiry has {quotations.length} quotations — open one, or create another.
          </p>
        </div>
        <Link to={`/quotations/new?enquiryId=${id}`}>
          <Button>
            <FilePlus2 className="h-4 w-4" />
            New quotation
          </Button>
        </Link>
      </div>
      <QuotationTable quotations={quotations} />
    </div>
  );
}
