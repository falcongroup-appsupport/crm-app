import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";
import {
  FieldLabel,
  FormRow,
  Input,
  Select,
  Textarea,
} from "../../../../shared/components/forms";
import { ApiError } from "../../../../shared/api/axiosInstance";
import { useToast } from "../../../../shared/components/feedback/toast/useToast";
import { formatCurrency } from "../../../../shared/utils";
import { useActivities } from "../../../masters/activities/hooks/useActivities";
import { EMIRATES } from "../../../enquiries/constants/enquiryStatus";
import { quotationApi } from "../api/quotation.api";
import {
  usePaymentTerms,
  termLabel,
  termDetails,
} from "../hooks/usePaymentTerms";
import { CURRENCIES } from "../constants/quotationConstants";
import {
  buildQuotationPayload,
  computeTotalDays,
  computeTotals,
  emptyQuotation,
  normalizeQuotation,
} from "../schemas/quotation.schema";
import { QuotationItemsTable } from "./QuotationItemsTable";
import { QuotationDurationTable } from "./QuotationDurationTable";

const CARD =
  "rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800";
const TITLE = "mb-4 text-sm font-semibold text-ink-900 dark:text-ink-50";

/**
 * create: pass `enquiry` (pre-fills customer, project and items from it).
 * edit:   pass `quotation` (the record from GET /api/quotation/{id}).
 */
export function QuotationForm({ mode, enquiry, quotation }) {
  const navigate = useNavigate();
  const { activities } = useActivities();
  const { terms } = usePaymentTerms();
  const enquiryId = mode === "edit" ? quotation.enquiryId : enquiry.id;

  const [form, setForm] = useState(() =>
    mode === "edit" ? normalizeQuotation(quotation) : emptyQuotation(enquiry),
  );
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setAddress = (patch) =>
    setForm((f) => ({
      ...f,
      customerAddress: { ...f.customerAddress, ...patch },
    }));

  const totals = computeTotals(form.items, form.discount);
  const totalDays = computeTotalDays(form.durations);

  const pickTerm = (value) => {
    const term = terms.find((t) => String(t.id) === value);
    set({
      paymentTermId: value,
      ...(term
        ? {
            detailedPaymentTerms:
              termDetails(term) || form.detailedPaymentTerms,
          }
        : {}),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = buildQuotationPayload(form, enquiryId);
      if (mode === "edit") await quotationApi.update(quotation.id, body);
      else await quotationApi.create(body);
      toast.success(
        mode === "edit" ? "Quotation updated" : "Quotation created",
        { description: form.quotationReference },
      );
      navigate(`/enquiries/${enquiryId}/quotation`);
    } catch (err) {
      toast.error(
        mode === "edit"
          ? "Couldn't update the quotation"
          : "Couldn't create the quotation",
        {
          description:
            err instanceof ApiError ? err.message : "Please try again.",
        },
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <Link
          to={
            mode === "edit"
              ? `/enquiries/${enquiryId}/quotation`
              : "/quotations"
          }
          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-950 dark:text-white">
            {mode === "edit" ? "Edit quotation" : "New quotation"}
          </h1>
          <p className="font-mono text-sm text-ink-400">
            {mode === "edit"
              ? form.quotationReference
              : `For enquiry ${enquiry?.enquiryNo ?? ""}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className={CARD}>
          <p className={TITLE}>Quotation details</p>
          <FormRow>
            <div>
              <FieldLabel required>Quotation reference</FieldLabel>
              <Input
                required
                value={form.quotationReference}
                onChange={(e) => set({ quotationReference: e.target.value })}
                placeholder="QT-REF-001"
              />
            </div>
            <div>
              <FieldLabel required>Quotation date</FieldLabel>
              <Input
                required
                type="date"
                value={form.quotationDate}
                onChange={(e) => set({ quotationDate: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Validity (days)</FieldLabel>
              <Input
                type="number"
                min="0"
                value={form.quotationValidity}
                onChange={(e) => set({ quotationValidity: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Currency</FieldLabel>
              <Select
                value={form.currency}
                onChange={(e) => set({ currency: e.target.value })}
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </div>
          </FormRow>
        </section>

        <section className={CARD}>
          <p className={TITLE}>Customer / Client</p>
          <FormRow>
            <div>
              <FieldLabel required>Customer / Client name</FieldLabel>
              <Input
                required
                value={form.customerName}
                onChange={(e) => set({ customerName: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Attention to</FieldLabel>
              <Input
                value={form.attentionTo}
                onChange={(e) => set({ attentionTo: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={form.emailId}
                onChange={(e) => set({ emailId: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Contact number</FieldLabel>
              <Input
                value={form.contactNumber}
                onChange={(e) => set({ contactNumber: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel required>Project name</FieldLabel>
              <Input
                required
                value={form.projectName}
                onChange={(e) => set({ projectName: e.target.value })}
              />
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
                onChange={(e) =>
                  setAddress({ buildingCommunityName: e.target.value })
                }
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
                onChange={(e) =>
                  setAddress({ additionalLandmarks: e.target.value })
                }
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
                onChange={(e) => set({ discount: e.target.value })}
                className="w-32! text-right"
              />
            </div>
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
                onChange={(e) => set({ detailedPaymentTerms: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Terms &amp; conditions</FieldLabel>
              <Textarea
                rows={4}
                value={form.termsAndConditions}
                onChange={(e) => set({ termsAndConditions: e.target.value })}
              />
            </div>
            <div className="lg:col-span-2">
              <FieldLabel>Internal remarks</FieldLabel>
              <Textarea
                rows={3}
                value={form.internalRemarks}
                onChange={(e) => set({ internalRemarks: e.target.value })}
                placeholder="Not shown to the client"
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-2 border-t border-ink-100 pt-5 dark:border-ink-800">
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving
              ? "Saving…"
              : mode === "edit"
                ? "Save changes"
                : "Create quotation"}
          </Button>
        </div>
      </form>
    </div>
  );
}
