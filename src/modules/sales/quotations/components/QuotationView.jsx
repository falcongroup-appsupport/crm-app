import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronLeft, FilePlus2, Mail, Pencil, Phone } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";
import { ReadField } from "../../../../shared/components/ui/ReadField";
import { ApiError } from "../../../../shared/api/axiosInstance";
import { useToast } from "../../../../shared/components/feedback/toast/useToast";
import { formatCurrency, formatDate, formatDateTime } from "../../../../shared/utils";
import { StatusBadge } from "../../../enquiries/components/StatusBadge";
import { useEnquiry } from "../../../enquiries/hooks/useEnquiry";
import { enquiryApi } from "../../../enquiries/api/enquiry.api";
import { FollowUpHistory } from "../../follow-ups/components/FollowUpHistory";
import { usePaymentTerms, termLabel } from "../hooks/usePaymentTerms";
import { daysLeft, validUntil } from "../schemas/quotation.schema";
import { QuotationStatusBadge } from "./QuotationStatusBadge";

const CARD =
  "rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800";
const TITLE = "mb-4 text-xs font-semibold uppercase tracking-wide text-ink-400";
const GRID =
  "grid grid-cols-[repeat(auto-fill,minmax(max(14rem,calc((100%_-_3rem)/4)),1fr))] gap-x-4 gap-y-5";
const LINK =
  "inline-flex items-center gap-1.5 text-signal-600 hover:text-signal-700 dark:text-signal-400";

function ExpiryHint({ date }) {
  const left = daysLeft(date);
  if (left === null) return null;
  const text =
    left < 0
      ? `expired ${-left} day${left === -1 ? "" : "s"} ago`
      : left === 0
        ? "expires today"
        : `${left} day${left === 1 ? "" : "s"} left`;
  const tone =
    left < 0
      ? "text-signal-600 dark:text-signal-400"
      : left <= 3
        ? "text-amber-600 dark:text-amber-400"
        : "text-ink-400";
  return <span className={`ml-2 text-xs font-normal ${tone}`}>({text})</span>;
}

/** Read-only quotation (GET /api/quotation/{id}) with follow-ups. */
export function QuotationView({ quotation }) {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { enquiry, refresh } = useEnquiry(quotation.enquiryId, {
    enabled: Boolean(quotation.enquiryId),
  });
  const { terms } = usePaymentTerms();
  const [marking, setMarking] = useState(false);

  const currency = quotation.currency || "AED";
  const address = quotation.customerAddress ?? {};
  const delivered = enquiry?.currentStatus === "QUOTATION_DELIVERED";
  const expiry = validUntil(quotation.quotationDate, quotation.quotationValidity);
  const term = terms.find((t) => String(t.id) === String(quotation.paymentTermId));
  const termName =
    quotation.paymentTermName ||
    (term
      ? termLabel(term)
      : quotation.paymentTermId
        ? `Term #${quotation.paymentTermId}`
        : "");
  const lead =
    quotation.enquiryLead && quotation.enquiryLead !== "NO_LEAD"
      ? quotation.enquiryLead
      : "No lead";
  // city and emirate are often the same ("Dubai, Dubai") — show each part once
  const addressLine = [
    ...new Set(
      [
        address.officeNumber,
        address.buildingCommunityName,
        address.streetAddress,
        address.area,
        address.city,
        address.emirate,
      ].filter(Boolean),
    ),
  ].join(", ");

  useEffect(() => {
    if (hash === "#follow-ups")
      document.getElementById("follow-ups")?.scrollIntoView({ behavior: "smooth" });
  }, [hash, quotation.id]);

  const markDelivered = async () => {
    setMarking(true);
    try {
      await enquiryApi.update(quotation.enquiryId, {
        currentStatus: "QUOTATION_DELIVERED",
      });
      await refresh();
      toast.success("Marked as delivered", {
        description: `${quotation.enquiryNo ?? "The enquiry"} is now Quotation Delivered`,
      });
    } catch (err) {
      toast.error("Couldn't mark it delivered", {
        description: err instanceof ApiError ? err.message : "Please try again.",
      });
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link
            to="/quotations"
            className="mt-0.5 rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-lg font-semibold text-ink-950 dark:text-white">
                {quotation.quotationNo || quotation.quotationReference}
              </h1>
              <QuotationStatusBadge status={quotation.status} />
              {enquiry && <StatusBadge status={enquiry.currentStatus} />}
            </div>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              {quotation.customerName} · Ref {quotation.quotationReference} ·{" "}
              <Link
                to={`/enquiries/${quotation.enquiryId}`}
                className="font-mono hover:text-signal-600"
              >
                {quotation.enquiryNo ?? `Enquiry #${quotation.enquiryId}`}
              </Link>
            </p>
            <p className="mt-0.5 text-xs text-ink-400">
              Created {formatDateTime(quotation.createdAt)}
              {quotation.updatedAt &&
                quotation.updatedAt !== quotation.createdAt &&
                ` · Updated ${formatDateTime(quotation.updatedAt)}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/quotations/new?enquiryId=${quotation.enquiryId}`)}
          >
            <FilePlus2 className="h-4 w-4" />
            New quotation for this enquiry
          </Button>
          {enquiry && !delivered && (
            <Button
              variant="secondary"
              size="sm"
              onClick={markDelivered}
              disabled={marking}
            >
              <CheckCircle2 className="h-4 w-4" />
              {marking ? "Updating…" : "Mark as delivered"}
            </Button>
          )}
          <Button size="sm" onClick={() => navigate(`/quotations/${quotation.id}/edit`)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* summary strip */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-ink-100 ring-1 ring-ink-100 md:grid-cols-4 dark:bg-ink-800 dark:ring-ink-800">
        {[
          ["Total", formatCurrency(quotation.total, currency)],
          ["Subtotal", formatCurrency(quotation.subtotal, currency)],
          ["VAT", formatCurrency(quotation.salesTax, currency)],
          ["Duration", `${quotation.estimatedTotalDays ?? 0} days`],
        ].map(([label, value], i) => (
          <div key={label} className="bg-white px-5 py-4 dark:bg-ink-900">
            <p className="text-xs text-ink-400">{label}</p>
            <p
              className={`mt-1 font-display tabular ${i === 0 ? "text-xl font-semibold text-ink-950 dark:text-white" : "text-base font-medium text-ink-800 dark:text-ink-100"}`}
            >
              {value}
            </p>
          </div>
        ))}
      </section>

      {/* quotation details */}
      <section className={CARD}>
        <p className={TITLE}>Quotation details</p>
        <div className={GRID}>
          <ReadField label="Quotation number" value={quotation.quotationNo} />
          <ReadField label="Reference" value={quotation.quotationReference} />
          <ReadField label="Status">
            <QuotationStatusBadge status={quotation.status} />
          </ReadField>
          <ReadField label="Quotation date" value={formatDate(quotation.quotationDate)} />
          <ReadField
            label="Validity"
            value={
              quotation.quotationValidity ? `${quotation.quotationValidity} days` : ""
            }
          />
          <ReadField label="Valid until">
            {expiry ? (
              <>
                {formatDate(expiry)}
                <ExpiryHint date={expiry} />
              </>
            ) : (
              "—"
            )}
          </ReadField>
          <ReadField label="Currency" value={currency} />
          <ReadField label="Enquiry">
            <Link
              to={`/enquiries/${quotation.enquiryId}`}
              className={`${LINK} font-mono`}
            >
              {quotation.enquiryNo ?? `#${quotation.enquiryId}`}
            </Link>
          </ReadField>
          <ReadField label="Enquiry lead" value={lead} />
          <ReadField label="Payment term" value={termName} />
        </div>
      </section>

      {/* customer */}
      <section className={CARD}>
        <p className={TITLE}>Customer / Client</p>
        <div className={GRID}>
          <ReadField label="Customer / Client" value={quotation.customerName} />
          <ReadField label="Attention to" value={quotation.attentionTo} />
          <ReadField label="Email">
            {quotation.emailId ? (
              <a href={`mailto:${quotation.emailId}`} className={`${LINK} break-all`}>
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {quotation.emailId}
              </a>
            ) : (
              "—"
            )}
          </ReadField>
          <ReadField label="Contact number">
            {quotation.contactNumber ? (
              <a href={`tel:${quotation.contactNumber}`} className={LINK}>
                <Phone className="h-3.5 w-3.5" />
                {quotation.contactNumber}
              </a>
            ) : (
              "—"
            )}
          </ReadField>
          <div className="sm:col-span-2">
            <ReadField label="Project" value={quotation.projectName} />
          </div>
          <div className="sm:col-span-2">
            <ReadField label="Address" value={addressLine} />
          </div>
          <ReadField label="PO box" value={address.poBox} />
          <ReadField label="Landmarks" value={address.additionalLandmarks} />
        </div>
      </section>

      {/* items */}
      <section className={CARD}>
        <p className={TITLE}>Items ({quotation.items?.length ?? 0})</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
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
                  <td className="px-3 py-2 text-ink-600 dark:text-ink-300">{it.unit}</td>
                  <td className="px-3 py-2 text-right tabular">{Number(it.quantity)}</td>
                  <td className="px-3 py-2 text-right tabular">
                    {formatCurrency(it.rate, currency)}
                  </td>
                  <td className="px-3 py-2 text-right tabular">
                    {formatCurrency(it.amount, currency)}
                  </td>
                  <td className="px-3 py-2 text-right tabular text-ink-500">
                    {formatCurrency(it.vatAED, currency)}{" "}
                    <span className="text-xs">({Number(it.vatPercentage)}%)</span>
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
            <span className="tabular">{formatCurrency(quotation.total, currency)}</span>
          </div>
        </div>
      </section>

      {/* duration */}
      <section className={CARD}>
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Duration
          </p>
          <p className="text-xs text-ink-400">
            Estimated total:{" "}
            <span className="font-semibold text-ink-700 dark:text-ink-200">
              {Number(quotation.estimatedTotalDays ?? 0)} days
            </span>
          </p>
        </div>
        {(quotation.durations ?? []).length === 0 ? (
          <p className="text-sm text-ink-400">No duration breakdown.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <tbody>
              {quotation.durations.map((d, i) => (
                <tr
                  key={d.id ?? i}
                  className="border-t border-ink-50 first:border-0 dark:border-ink-800"
                >
                  <td className="w-10 py-2 pr-3 text-ink-400">{d.slNo ?? i + 1}</td>
                  <td className="py-2 pr-3 font-medium text-ink-900 dark:text-ink-50">
                    {d.description}
                  </td>
                  <td className="py-2 pr-3 tabular text-ink-700 dark:text-ink-200">
                    {Number(d.duration)} {d.unit}
                  </td>
                  <td className="py-2 text-ink-500">{d.remarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* payment + notes */}
      <section className={CARD}>
        <p className={TITLE}>Payment terms &amp; notes</p>
        <div className="grid gap-5 lg:grid-cols-2">
          <ReadField label={termName ? `Payment terms — ${termName}` : "Payment terms"}>
            <span className="whitespace-pre-line">
              {quotation.detailedPaymentTerms || "—"}
            </span>
          </ReadField>
          <ReadField label="Terms & conditions">
            <span className="whitespace-pre-line">
              {quotation.termsAndConditions || "—"}
            </span>
          </ReadField>
          <ReadField label="Internal remarks (not shown to the client)">
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
