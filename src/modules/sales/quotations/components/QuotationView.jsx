import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronLeft, Pencil } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";
import { ReadField } from "../../../../shared/components/ui/ReadField";
import { ApiError } from "../../../../shared/api/axiosInstance";
import { useToast } from "../../../../shared/components/feedback/toast/useToast";
import { formatCurrency, formatDate } from "../../../../shared/utils";
import { StatusBadge } from "../../../enquiries/components/StatusBadge";
import { useEnquiry } from "../../../enquiries/hooks/useEnquiry";
import { enquiryApi } from "../../../enquiries/api/enquiry.api";
import { FollowUpHistory } from "../../follow-ups/components/FollowUpHistory";

const CARD =
  "rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800";
const TITLE = "mb-3 text-xs font-semibold tracking-wide text-ink-400";
const GRID =
  "grid grid-cols-[repeat(auto-fill,minmax(max(14rem,calc((100%_-_3rem)/4)),1fr))] gap-4";

export function QuotationView({ quotation }) {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const { enquiry, refresh } = useEnquiry(quotation.enquiryId);
  const [marking, setMarking] = useState(false);
  const toast = useToast();
  const currency = quotation.currency || "AED";
  const address = quotation.customerAddress ?? {};
  const delivered = enquiry?.currentStatus === "QUOTATION_DELIVERED";

  useEffect(() => {
    if (hash === "#follow-ups")
      document
        .getElementById("follow-ups")
        ?.scrollIntoView({ behavior: "smooth" });
  }, [hash, quotation.id]);

  const markDelivered = async () => {
    setMarking(true);
    try {
      await enquiryApi.update(quotation.enquiryId, {
        currentStatus: "QUOTATION_DELIVERED",
      });
      await refresh();
      toast.success("Marked as delivered", {
        description: `${enquiry?.enquiryNo ?? "The enquiry"} moved to Quotations issued`,
      });
    } catch (err) {
      toast.error("Couldn't mark it delivered", {
        description:
          err instanceof ApiError ? err.message : "Please try again.",
      });
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/quotations"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-lg font-semibold text-ink-950 dark:text-white">
                {quotation.quotationReference}
              </h1>
              {enquiry && <StatusBadge status={enquiry.currentStatus} />}
            </div>
            <p className="text-sm text-ink-400">
              {quotation.customerName} ·{" "}
              <Link
                to={`/enquiries/${quotation.enquiryId}`}
                className="hover:text-signal-600"
              >
                {enquiry?.enquiryNo ?? `Enquiry #${quotation.enquiryId}`}
              </Link>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!delivered && (
            <Button
              variant="secondary"
              size="sm"
              onClick={markDelivered}
              disabled={marking || !enquiry}
            >
              <CheckCircle2 className="h-4 w-4" />
              {marking ? "Updating…" : "Mark as delivered"}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => navigate(`/quotations/${quotation.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <section className={CARD}>
        <p className={TITLE}>Quotation details</p>
        <div className={GRID}>
          <ReadField label="Reference" value={quotation.quotationReference} />
          <ReadField label="Date" value={formatDate(quotation.quotationDate)} />
          <ReadField
            label="Validity"
            value={
              quotation.quotationValidity
                ? `${quotation.quotationValidity} days`
                : ""
            }
          />
          <ReadField label="Currency" value={currency} />
          <ReadField label="Customer / Client" value={quotation.customerName} />
          <ReadField label="Attention to" value={quotation.attentionTo} />
          <ReadField label="Email" value={quotation.emailId} />
          <ReadField label="Contact number" value={quotation.contactNumber} />
          <div className="sm:col-span-2">
            <ReadField label="Project" value={quotation.projectName} />
          </div>
        </div>
      </section>

      <section className={CARD}>
        <p className={TITLE}>Customer address</p>
        <div className={GRID}>
          <ReadField label="Emirate" value={address.emirate} />
          <ReadField label="City" value={address.city} />
          <ReadField label="Office number" value={address.officeNumber} />
          <ReadField
            label="Building / Community"
            value={address.buildingCommunityName}
          />
          <ReadField label="Street" value={address.streetAddress} />
          <ReadField label="Area" value={address.area} />
          <ReadField label="PO box" value={address.poBox} />
          <ReadField label="Landmarks" value={address.additionalLandmarks} />
        </div>
      </section>

      <section className={CARD}>
        <p className={TITLE}>Items</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="bg-ink-50 text-xs text-ink-400 dark:bg-ink-800">
                {[
                  "#",
                  "Activity",
                  "Description",
                  "Unit",
                  "Qty",
                  "Rate",
                  "Amount",
                  "VAT",
                  "Total",
                ].map((c, i) => (
                  <th
                    key={c}
                    className={`px-3 py-2 font-medium ${i >= 4 ? "text-right" : ""}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(quotation.items ?? []).map((it, i) => (
                <tr
                  key={it.id ?? i}
                  className="border-t border-ink-50 dark:border-ink-800"
                >
                  <td className="px-3 py-2 text-ink-400">{it.slNo ?? i + 1}</td>
                  <td className="px-3 py-2 font-medium text-ink-900 dark:text-ink-50">
                    {it.activityName}
                  </td>
                  <td className="px-3 py-2 text-ink-600 dark:text-ink-300">
                    {it.itemDescription}
                  </td>
                  <td className="px-3 py-2 text-ink-600 dark:text-ink-300">
                    {it.unit}
                  </td>
                  <td className="px-3 py-2 text-right tabular">
                    {it.quantity}
                  </td>
                  <td className="px-3 py-2 text-right tabular">
                    {formatCurrency(it.rate, currency)}
                  </td>
                  <td className="px-3 py-2 text-right tabular">
                    {formatCurrency(it.amount, currency)}
                  </td>
                  <td className="px-3 py-2 text-right tabular text-ink-500">
                    {formatCurrency(it.vatAED, currency)}{" "}
                    <span className="text-xs">({it.vatPercentage}%)</span>
                  </td>
                  <td className="px-3 py-2 text-right font-medium tabular">
                    {formatCurrency(it.totalAED, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex flex-col items-end gap-1.5 border-t border-ink-100 pt-4 text-sm dark:border-ink-800">
          {[
            ["Subtotal", quotation.subtotal],
            ["VAT", quotation.salesTax],
            ["Discount", quotation.discount],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex w-full max-w-xs justify-between text-ink-600 dark:text-ink-300"
            >
              <span>{label}</span>
              <span className="tabular">{formatCurrency(value, currency)}</span>
            </div>
          ))}
          <div className="flex w-full max-w-xs justify-between border-t border-ink-100 pt-2 text-base font-semibold text-ink-950 dark:border-ink-800 dark:text-white">
            <span>Total</span>
            <span className="tabular">
              {formatCurrency(quotation.total, currency)}
            </span>
          </div>
        </div>
      </section>

      <section className={CARD}>
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-xs font-semibold tracking-wide text-ink-400">
            Duration
          </p>
          <p className="text-xs text-ink-400">
            Estimated total:{" "}
            <span className="font-semibold text-ink-700 dark:text-ink-200">
              {quotation.estimatedTotalDays ?? 0} days
            </span>
          </p>
        </div>
        <table className="w-full text-left text-sm">
          <tbody>
            {(quotation.durations ?? []).map((d, i) => (
              <tr
                key={d.id ?? i}
                className="border-t border-ink-50 first:border-0 dark:border-ink-800"
              >
                <td className="py-2 pr-3 text-ink-400">{d.slNo ?? i + 1}</td>
                <td className="py-2 pr-3 font-medium text-ink-900 dark:text-ink-50">
                  {d.description}
                </td>
                <td className="py-2 pr-3 tabular text-ink-700 dark:text-ink-200">
                  {d.duration} {d.unit}
                </td>
                <td className="py-2 text-ink-500">{d.remarks || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={CARD}>
        <p className={TITLE}>Payment terms &amp; notes</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <ReadField label="Detailed payment terms">
            <span className="whitespace-pre-line">
              {quotation.detailedPaymentTerms || "—"}
            </span>
          </ReadField>
          <ReadField label="Terms & conditions">
            <span className="whitespace-pre-line">
              {quotation.termsAndConditions || "—"}
            </span>
          </ReadField>
          <ReadField label="Internal remarks">
            <span className="whitespace-pre-line">
              {quotation.internalRemarks || "—"}
            </span>
          </ReadField>
        </div>
      </section>

      <FollowUpHistory quotation={quotation} />
    </div>
  );
}
