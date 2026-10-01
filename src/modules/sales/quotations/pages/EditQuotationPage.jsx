import { Link, useParams } from "react-router-dom";
import { Loader } from "../../../../shared/components/feedback/Loader";
import { useQuotation } from "../hooks/useQuotation";
import { QuotationForm } from "../components/QuotationForm";

export default function EditQuotationPage() {
  const { id } = useParams();
  const { quotation, loading, error } = useQuotation(id);

  if (loading) return <Loader label="Loading quotation…" />;
  if (error || !quotation) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-8">
        <p className="rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">{error || "Quotation not found."}</p>
        <Link to="/quotations" className="text-sm font-medium text-signal-600 hover:text-signal-700">Back to quotations</Link>
      </div>
    );
  }
  return <QuotationForm mode="edit" quotation={quotation} />;
}
