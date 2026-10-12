import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";
import {
  FieldError,
  FieldLabel,
  FormRow,
  Input,
  Select,
  Textarea,
} from "../../../../shared/components/forms";
import { ApiError } from "../../../../shared/api/axiosInstance";
import { useToast } from "../../../../shared/components/feedback/toast/useToast";
import { formatCurrency, formatDate } from "../../../../shared/utils";
import { useActivities } from "../../../masters/activities/hooks/useActivities";
import { EMIRATES } from "../../../enquiries/constants/enquiryStatus";
import { quotationApi } from "../api/quotation.api";
import { usePaymentTerms, termLabel, termDetails } from "../hooks/usePaymentTerms";
import { CURRENCIES } from "../constants/quotationConstants";
import {
  buildQuotationPayload,
  computeTotalDays,
  computeTotals,
  daysLeft,
  emptyQuotation,
  normalizeQuotation,
  validateQuotation,
  validUntil,
} from "../schemas/quotation.schema";
import { QuotationItemsTable } from "./QuotationItemsTable";
import { QuotationDurationTable } from "./QuotationDurationTable";
import { QuotationStatusBadge } from "./QuotationStatusBadge";

const CARD =
  "rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800";
const TITLE = "mb-4 text-sm font-semibold text-ink-900 dark:text-ink-50";

/**
 * create: pass `enquiry` (full GET /api/enquiry/{id} record — pre-fills the
 *         customer, contact, project, emirate and items).
 * edit:   pass `quotation` (GET /api/quotation/{id}).
 */
export function QuotationForm({ mode, enquiry, quotation }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { activities } = useActivities();
  const { terms } = usePaymentTerms();
  const enquiryId = mode === "edit" ? quotation.enquiryId : enquiry.id;
  const enquiryNo = mode === "edit" ? quotation.enquiryNo : enquiry?.enquiryNo;

  const [form, setForm] = useState(() =>
    mode === "edit" ? normalizeQuotation(quotation) : emptyQuotation(enquiry),
  );
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = useMemo(
    () => (attempted ? validateQuotation(form) : {}),
    [attempted, form],
  );
  const invalid = (key) => Boolean(errors[key]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setAddress = (patch) =>
    setForm((f) => ({ ...f, customerAddress: { ...f.customerAddress, ...patch } }));

  const totals = computeTotals(form.items, form.discount);
  const totalDays = computeTotalDays(form.durations);
  const expiry = validUntil(form.quotationDate, form.quotationValidity);

  const pickTerm = (value) => {
    const term = terms.find((t) => String(t.id) === value);
    set({
      paymentTermId: value,
      ...(term
        ? { detailedPaymentTerms: termDetails(term) || form.detailedPaymentTerms }
        : {}),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    const found = validateQuotation(form);
    const count = Object.keys(found).length;
    if (count) {
      toast.warning(
        count === 1 ? "1 field needs attention" : `${count} fields need attention`,
        { description: "They're highlighted in red on the form." },
      );
      setTimeout(() => {
        const first = document.querySelector('[aria-invalid="true"]');
        first?.scrollIntoView({ behavior: "smooth", block: "center" });
        first?.focus({ preventScroll: true });
      }, 0);
      return;
    }

    setSaving(true);
    try {
      const body = buildQuotationPayload(form, enquiryId);
      const saved =
        mode === "edit"
          ? await quotationApi.update(quotation.id, body)
          : await quotationApi.create(body);
      const id = saved?.id ?? quotation?.id;
      toast.success(mode === "edit" ? "Quotation updated" : "Quotation created", {
        description:
          saved?.quotationNo ?? quotation?.quotationNo ?? form.quotationReference,
      });
      navigate(id ? `/quotations/${id}` : "/quotations");
    } catch (err) {
      toast.error(
        mode === "edit"
          ? "Couldn't update the quotation"
          : "Couldn't create the quotation",
        {
          description: err instanceof ApiError ? err.message : "Please try again.",
        },
      );
    } finally {
      setSaving(false);
    }
  };

  const back =
    mode === "edit"
      ? `/quotations/${quotation.id}`
      : enquiryId
        ? `/enquiries/${enquiryId}`
        : "/quotations";
  const left = daysLeft(expiry);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <Link
          to={back}
          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-ink-950 dark:text-white">
              {mode === "edit" ? "Edit quotation" : "New quotation"}
            </h1>
            {mode === "edit" && <QuotationStatusBadge status={quotation.status} />}
          </div>
          <p className="text-sm text-ink-400">
            {mode === "edit" ? (
              <span className="font-mono">{quotation.quotationNo}</span>
            ) : (
              "Quotation number is generated on save"
            )}
            {enquiryNo && (
              <>
                {" · for enquiry "}
                <Link
                  to={`/enquiries/${enquiryId}`}
                  className="font-mono hover:text-signal-600"
                >
                  {enquiryNo}
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <section className={CARD}>
          <p className={TITLE}>Quotation details</p>
          <FormRow>
            <div>
              <FieldLabel required>Quotation reference</FieldLabel>
              <Input
                value={form.quotationReference}
                aria-invalid={invalid("quotationReference")}
                onChange={(e) => set({ quotationReference: e.target.value })}
                placeholder="QT-REF-001"
              />
              <FieldError>{errors.quotationReference}</FieldError>
            </div>
            <div>
              <FieldLabel required>Quotation date</FieldLabel>
              <Input
                type="date"
                value={form.quotationDate}
                aria-invalid={invalid("quotationDate")}
                onChange={(e) => set({ quotationDate: e.target.value })}
              />
              <FieldError>{errors.quotationDate}</FieldError>
            </div>
            <div>
              <FieldLabel required>Validity (days)</FieldLabel>
              <Input
                type="number"
                min="1"
                max="365"
                step="1"
                value={form.quotationValidity}
                aria-invalid={invalid("quotationValidity")}
                onChange={(e) => set({ quotationValidity: e.target.value })}
              />
              {errors.quotationValidity ? (
                <FieldError>{errors.quotationValidity}</FieldError>
              ) : (
                expiry && (
                  <p
                    className={`mt-1 text-xs ${left !== null && left < 0 ? "text-signal-600 dark:text-signal-400" : "text-ink-400"}`}
                  >
                    Valid until {formatDate(expiry)}
                    {left !== null && left < 0 ? " — already expired" : ""}
                  </p>
                )
              )}
            </div>
            <div>
              <FieldLabel required>Currency</FieldLabel>
              <Select
                value={form.currency}
                aria-invalid={invalid("currency")}
                onChange={(e) => set({ currency: e.target.value })}
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
              <FieldError>{errors.currency}</FieldError>
            </div>
          </FormRow>
        </section>

        <section className={CARD}>
          <p className={TITLE}>Customer / Client</p>
          <FormRow>
            <div>
              <FieldLabel required>Customer / Client</FieldLabel>
              <Input
                value={form.customerName}
                aria-invalid={invalid("customerName")}
                onChange={(e) => set({ customerName: e.target.value })}
                placeholder="Company name"
              />
              <FieldError>{errors.customerName}</FieldError>
            </div>
            <div>
              <FieldLabel>Attention to</FieldLabel>
              <Input
                value={form.attentionTo}
                aria-invalid={invalid("attentionTo")}
                onChange={(e) => set({ attentionTo: e.target.value })}
                placeholder="Contact person"
              />
              <FieldError>{errors.attentionTo}</FieldError>
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={form.emailId}
                aria-invalid={invalid("emailId")}
                onChange={(e) => set({ emailId: e.target.value })}
                placeholder="name@company.com"
              />
              <FieldError>{errors.emailId}</FieldError>
            </div>
            <div>
              <FieldLabel>Contact number</FieldLabel>
              <Input
                type="tel"
                value={form.contactNumber}
                aria-invalid={invalid("contactNumber")}
                onChange={(e) => set({ contactNumber: e.target.value })}
                placeholder="+971 5X XXX XXXX"
              />
              <FieldError>{errors.contactNumber}</FieldError>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel required>Project name</FieldLabel>
              <Input
                value={form.projectName}
                aria-invalid={invalid("projectName")}
                onChange={(e) => set({ projectName: e.target.value })}
              />
              <FieldError>{errors.projectName}</FieldError>
            </div>
          </FormRow>
        </section>

        <section className={CARD}>
          <p className={TITLE}>Customer address</p>
          <FormRow>
            <div>
              <FieldLabel>Emirate</FieldLabel>
              <Select
                value={form.customerAddress.emirate}
                onChange={(e) => setAddress({ emirate: e.target.value })}
              >
                <option value="">Select emirate…</option>
                {form.customerAddress.emirate &&
                  !EMIRATES.includes(form.customerAddress.emirate) && (
                    <option>{form.customerAddress.emirate}</option>
                  )}
                {EMIRATES.map((em) => (
                  <option key={em}>{em}</option>
                ))}
              </Select>
            </div>
            <div>
              <FieldLabel>City</FieldLabel>
              <Input
                value={form.customerAddress.city}
                onChange={(e) => setAddress({ city: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Office number</FieldLabel>
              <Input
                value={form.customerAddress.officeNumber}
                onChange={(e) => setAddress({ officeNumber: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Building / Community</FieldLabel>
              <Input
                value={form.customerAddress.buildingCommunityName}
                onChange={(e) => setAddress({ buildingCommunityName: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Street address</FieldLabel>
              <Input
                value={form.customerAddress.streetAddress}
                onChange={(e) => setAddress({ streetAddress: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Area</FieldLabel>
              <Input
                value={form.customerAddress.area}
                onChange={(e) => setAddress({ area: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>PO box</FieldLabel>
              <Input
                value={form.customerAddress.poBox}
                onChange={(e) => setAddress({ poBox: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Additional landmarks</FieldLabel>
              <Input
                value={form.customerAddress.additionalLandmarks}
                onChange={(e) => setAddress({ additionalLandmarks: e.target.value })}
              />
            </div>
          </FormRow>
        </section>

        <section className={CARD}>
          <p className={TITLE}>Items</p>
          <QuotationItemsTable
            items={form.items}
            activities={activities}
            currency={form.currency}
            onChange={(items) => set({ items })}
            errors={errors}
          />

          <div className="mt-5 flex flex-col items-end gap-2 border-t border-ink-100 pt-4 text-sm dark:border-ink-800">
            <div className="flex w-full max-w-xs justify-between text-ink-600 dark:text-ink-300">
              <span>Subtotal</span>
              <span className="tabular">
                {formatCurrency(totals.subtotal, form.currency)}
              </span>
            </div>
            <div className="flex w-full max-w-xs justify-between text-ink-600 dark:text-ink-300">
              <span>VAT</span>
              <span className="tabular">
                {formatCurrency(totals.salesTax, form.currency)}
              </span>
            </div>
            <div className="flex w-full max-w-xs items-center justify-between gap-3 text-ink-600 dark:text-ink-300">
              <span>Discount</span>
              <Input
                type="number"
                min="0"
                step="any"
                value={form.discount}
                aria-invalid={invalid("discount")}
                onChange={(e) => set({ discount: e.target.value })}
                className="!w-32 text-right"
              />
            </div>
            {errors.discount && (
              <div className="w-full max-w-xs text-right">
                <FieldError>{errors.discount}</FieldError>
              </div>
            )}
            <div className="flex w-full max-w-xs justify-between border-t border-ink-100 pt-2 text-base font-semibold text-ink-950 dark:border-ink-800 dark:text-white">
              <span>Total</span>
              <span className="tabular">
                {formatCurrency(totals.total, form.currency)}
              </span>
            </div>
          </div>
        </section>

        <section className={CARD}>
          <div className="mb-4 flex items-baseline justify-between">
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
              Duration
            </p>
            <p className="text-xs text-ink-400">
              Estimated total:{" "}
              <span className="font-semibold text-ink-700 dark:text-ink-200">
                {totalDays} days
              </span>
            </p>
          </div>
          <QuotationDurationTable
            durations={form.durations}
            onChange={(durations) => set({ durations })}
            errors={errors}
          />
        </section>

        <section className={CARD}>
          <p className={TITLE}>Payment terms &amp; notes</p>
          <FormRow>
            <div>
              <FieldLabel>Payment term</FieldLabel>
              <Select
                value={form.paymentTermId}
                onChange={(e) => pickTerm(e.target.value)}
              >
                <option value="">Select payment term…</option>
                {form.paymentTermId &&
                  !terms.some((t) => String(t.id) === String(form.paymentTermId)) && (
                    <option value={form.paymentTermId}>
                      {quotation?.paymentTermName || `Term #${form.paymentTermId}`}
                    </option>
                  )}
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {termLabel(t)}
                  </option>
                ))}
              </Select>
            </div>
          </FormRow>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <FieldLabel>Detailed payment terms</FieldLabel>
              <Textarea
                rows={4}
                value={form.detailedPaymentTerms}
                aria-invalid={invalid("detailedPaymentTerms")}
                onChange={(e) => set({ detailedPaymentTerms: e.target.value })}
                placeholder={"25% Advance\n75% Against submission of Final Reports"}
              />
              <FieldError>{errors.detailedPaymentTerms}</FieldError>
            </div>
            <div>
              <FieldLabel>Terms &amp; conditions</FieldLabel>
              <Textarea
                rows={4}
                value={form.termsAndConditions}
                aria-invalid={invalid("termsAndConditions")}
                onChange={(e) => set({ termsAndConditions: e.target.value })}
              />
              <FieldError>{errors.termsAndConditions}</FieldError>
            </div>
            <div className="lg:col-span-2">
              <FieldLabel>Internal remarks</FieldLabel>
              <Textarea
                rows={3}
                value={form.internalRemarks}
                aria-invalid={invalid("internalRemarks")}
                onChange={(e) => set({ internalRemarks: e.target.value })}
                placeholder="Not shown to the client"
              />
              <FieldError>{errors.internalRemarks}</FieldError>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
          <p className="text-sm text-ink-500 dark:text-ink-400">
            {form.items.length} item{form.items.length === 1 ? "" : "s"} · Total{" "}
            <span className="font-semibold text-ink-900 dark:text-ink-50">
              {formatCurrency(totals.total, form.currency)}
            </span>
          </p>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Create quotation"}
          </Button>
        </div>
      </form>
    </div>
  );
}
