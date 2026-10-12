import { ErrorToast } from "../../../../shared/components/feedback/toast/ErrorToast";
import { useQuotations } from "../../quotations/hooks/useQuotations";
import { QuotationBrowser } from "../../quotations/components/QuotationBrowser";

/** Sales → Follow Up: pick a quotation to log or review follow-ups. */
export default function FollowUpListPage() {
  const { quotations, loading, error, refresh } = useQuotations();
  return (
    <div className="space-y-4">
      <ErrorToast error={error} title="Couldn't load quotations" onRetry={refresh} />
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-950 dark:text-white">
          Sales follow-ups
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Open a quotation to log a call, email or meeting and see its follow-up history.
        </p>
      </div>
      <QuotationBrowser
        quotations={quotations}
        loading={loading}
        mode="followup"
        emptyText="Follow-ups are logged against quotations."
      />
    </div>
  );
}
