import {
  CURRENCIES,
  DEFAULT_DURATION_DESCRIPTIONS,
  DEFAULT_VAT_PERCENTAGE,
} from "../constants/quotationConstants";
import { phoneError, todayLocal } from "../../../enquiries/schemas/enquiry.schema";

const str = (v) => (v === null || v === undefined ? "" : v);
/** Always a string — numbers from the API (validity 30, duration 2.00) included. */
const text = (v) => (v === null || v === undefined ? "" : String(v));

/**
 * A duration row is "in use" once it has a duration or remarks, or a
 * description the user typed. The pre-filled template rows (NOC / Authority
 * Permits, Mobilization, Field Works) left untouched are skipped on save.
 */
export function durationInUse(d) {
  if (text(d.duration).trim() !== "" || text(d.remarks).trim() !== "") return true;
  const desc = text(d.description).trim();
  return desc !== "" && !DEFAULT_DURATION_DESCRIPTIONS.includes(desc);
}
const num = (v) =>
  v === "" || v === null || v === undefined || Number.isNaN(Number(v)) ? 0 : Number(v);
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const emptyItem = () => ({
  activityId: "",
  activityName: "",
  itemDescription: "",
  unit: "LS",
  quantity: 1,
  rate: 0,
  vatPercentage: DEFAULT_VAT_PERCENTAGE,
});

export const emptyDuration = (description = "") => ({
  description,
  unit: "Days",
  duration: "",
  remarks: "",
});

const emptyAddress = () => ({
  emirate: "",
  city: "",
  officeNumber: "",
  buildingCommunityName: "",
  streetAddress: "",
  area: "",
  poBox: "",
  additionalLandmarks: "",
});

// ---- calculations (the backend receives the computed values, as in the sample body)

export function computeItem(item) {
  const amount = round2(num(item.quantity) * num(item.rate));
  const vatAED = round2((amount * num(item.vatPercentage)) / 100);
  return { amount, vatAED, totalAED: round2(amount + vatAED) };
}

export function computeTotals(items, discount) {
  const lines = items.map(computeItem);
  const subtotal = round2(lines.reduce((s, l) => s + l.amount, 0));
  const salesTax = round2(lines.reduce((s, l) => s + l.vatAED, 0));
  const disc = num(discount);
  return {
    subtotal,
    salesTax,
    discount: disc,
    total: round2(subtotal + salesTax - disc),
  };
}

export function computeTotalDays(durations) {
  return round2(
    durations
      .filter(durationInUse)
      .reduce((s, d) => s + num(d.duration) * (d.unit === "Weeks" ? 7 : 1), 0),
  );
}

// ---- form state

/** Starting point for a new quotation, pre-filled from the enquiry. */
export function emptyQuotation(enquiry) {
  const projects = enquiry?.projectInformations ?? [];
  const first = projects[0];
  const scopeItems = projects.flatMap((p) =>
    (p.scopeOfServices ?? []).map((s) => ({
      ...emptyItem(),
      activityId: str(s.activityId),
      activityName: str(s.activityName),
      itemDescription: s.remarks || s.activityName || "",
      unit: s.unit || "LS",
      quantity: s.quantity ?? 1,
    })),
  );

  return {
    quotationReference: "",
    quotationDate: todayLocal(),
    quotationValidity: 30,
    currency: "AED",
    // the quotation is addressed to the company, attention of the contact person
    customerName: enquiry?.companyName || "",
    attentionTo: enquiry?.contactPerson || enquiry?.customerName || "",
    emailId: str(enquiry?.customerEmail),
    contactNumber: str(enquiry?.contactNumber),
    projectName: str(first?.projectName),
    customerAddress: { ...emptyAddress(), emirate: str(first?.emirate) },
    items: scopeItems.length ? scopeItems : [emptyItem()],
    durations: DEFAULT_DURATION_DESCRIPTIONS.map((d) => emptyDuration(d)),
    discount: 0,
    paymentTermId: "",
    detailedPaymentTerms: "",
    internalRemarks: "",
    termsAndConditions: "",
  };
}

/** GET /api/quotation/{id} → safe form state (nulls become blanks). */
export function normalizeQuotation(q) {
  return {
    ...emptyQuotation(null),
    ...q,
    quotationReference: str(q?.quotationReference),
    quotationDate: str(q?.quotationDate).slice(0, 10),
    quotationValidity: q?.quotationValidity ?? 30,
    currency: q?.currency || "AED",
    customerName: str(q?.customerName),
    attentionTo: str(q?.attentionTo),
    emailId: str(q?.emailId),
    contactNumber: str(q?.contactNumber),
    projectName: str(q?.projectName),
    customerAddress: Object.fromEntries(
      Object.keys(emptyAddress()).map((k) => [k, str(q?.customerAddress?.[k])]),
    ),
    items: q?.items?.length
      ? q.items.map((it) => ({
          ...it,
          activityId: str(it.activityId),
          activityName: str(it.activityName),
          itemDescription: str(it.itemDescription),
          unit: it.unit || "LS",
          quantity: it.quantity ?? 1,
          rate: it.rate ?? 0,
          vatPercentage: it.vatPercentage ?? DEFAULT_VAT_PERCENTAGE,
        }))
      : [emptyItem()],
    durations: q?.durations?.length
      ? q.durations.map((d) => ({
          ...d,
          description: str(d.description),
          unit: d.unit || "Days",
          duration: str(d.duration),
          remarks: str(d.remarks),
        }))
      : DEFAULT_DURATION_DESCRIPTIONS.map((d) => emptyDuration(d)),
    discount: q?.discount ?? 0,
    paymentTermId: str(q?.paymentTermId),
    detailedPaymentTerms: str(q?.detailedPaymentTerms),
    internalRemarks: str(q?.internalRemarks),
    termsAndConditions: str(q?.termsAndConditions),
  };
}

/** Form state → body for POST /api/quotation and PUT /api/quotation/{id}. */
export function buildQuotationPayload(form, enquiryId) {
  const items = form.items.map((it, i) => {
    const c = computeItem(it);
    return {
      ...(it.id !== undefined && it.id !== null ? { id: it.id } : {}),
      slNo: i + 1,
      activityId: it.activityId === "" ? null : Number(it.activityId),
      activityName: it.activityName,
      itemDescription: it.itemDescription,
      unit: it.unit,
      quantity: num(it.quantity),
      rate: num(it.rate),
      amount: c.amount,
      vatPercentage: num(it.vatPercentage),
      vatAED: c.vatAED,
      totalAED: c.totalAED,
    };
  });
  const totals = computeTotals(form.items, form.discount);
  const durations = form.durations.filter(durationInUse).map((d, i) => ({
    ...(d.id !== undefined && d.id !== null ? { id: d.id } : {}),
    slNo: i + 1,
    description: d.description,
    unit: d.unit,
    duration: num(d.duration),
    remarks: d.remarks,
  }));

  return {
    enquiryId: Number(enquiryId),
    quotationReference: form.quotationReference,
    quotationDate: form.quotationDate,
    quotationValidity: num(form.quotationValidity),
    currency: form.currency,
    customerName: form.customerName,
    customerAddress: form.customerAddress,
    attentionTo: form.attentionTo,
    emailId: form.emailId,
    contactNumber: form.contactNumber,
    projectName: form.projectName,
    selectedActivityIds: [
      ...new Set(items.map((i) => i.activityId).filter((v) => v !== null)),
    ],
    durations,
    estimatedTotalDays: computeTotalDays(form.durations),
    items,
    ...totals,
    paymentTermId: form.paymentTermId === "" ? null : Number(form.paymentTermId),
    detailedPaymentTerms: form.detailedPaymentTerms,
    internalRemarks: form.internalRemarks,
    termsAndConditions: form.termsAndConditions,
  };
}

// ---- validity ---------------------------------------------------------------

/** quotationDate + quotationValidity days → "YYYY-MM-DD" (or null). */
export function validUntil(quotationDate, validityDays) {
  if (
    !quotationDate ||
    validityDays === "" ||
    validityDays === null ||
    validityDays === undefined
  )
    return null;
  const d = new Date(`${String(quotationDate).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + Number(validityDays));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Days until a quotation expires (negative = expired). */
export function daysLeft(dateStr) {
  if (!dateStr) return null;
  const today = new Date(`${todayLocal()}T00:00:00`);
  return Math.round((new Date(`${dateStr}T00:00:00`) - today) / 86_400_000);
}

// ---- validation -------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const blank = (v) => text(v).trim() === "";
const isNum = (v) => !blank(v) && Number.isFinite(Number(v));
const tooLong = (v, max) => text(v).trim().length > max;

/**
 * Validates the quotation form (POST and PUT). Returns { [key]: message };
 * keys: quotationReference, emailId, items.0.rate, durations.1.duration, discount…
 */
export function validateQuotation(form) {
  const e = {};

  if (blank(form.quotationReference)) e.quotationReference = "Reference is required";
  else if (tooLong(form.quotationReference, 50))
    e.quotationReference = "Keep it under 50 characters";
  if (blank(form.quotationDate)) e.quotationDate = "Quotation date is required";
  else if (Number.isNaN(Date.parse(form.quotationDate)))
    e.quotationDate = "Enter a valid date";
  if (blank(form.quotationValidity)) e.quotationValidity = "Validity is required";
  else if (
    !Number.isInteger(Number(form.quotationValidity)) ||
    Number(form.quotationValidity) < 1 ||
    Number(form.quotationValidity) > 365
  )
    e.quotationValidity = "Enter whole days between 1 and 365";
  if (!CURRENCIES.includes(form.currency)) e.currency = "Pick a currency";

  if (blank(form.customerName)) e.customerName = "Customer / client is required";
  else if (tooLong(form.customerName, 150))
    e.customerName = "Keep it under 150 characters";
  if (tooLong(form.attentionTo, 100)) e.attentionTo = "Keep it under 100 characters";
  if (!blank(form.emailId) && !EMAIL_RE.test(text(form.emailId).trim()))
    e.emailId = "Enter a valid email address";
  const phone = phoneError(form.contactNumber);
  if (phone) e.contactNumber = phone;
  if (blank(form.projectName)) e.projectName = "Project name is required";
  else if (tooLong(form.projectName, 255)) e.projectName = "Keep it under 255 characters";

  const items = form.items ?? [];
  if (!items.length) e.items = "Add at least one item";
  items.forEach((it, i) => {
    const k = `items.${i}`;
    if (blank(it.activityId)) e[`${k}.activityId`] = "Select an activity";
    if (blank(it.itemDescription)) e[`${k}.itemDescription`] = "Description is required";
    if (blank(it.unit)) e[`${k}.unit`] = "Select a unit";
    if (!isNum(it.quantity) || Number(it.quantity) <= 0)
      e[`${k}.quantity`] = "Quantity must be greater than 0";
    if (!isNum(it.rate) || Number(it.rate) < 0) e[`${k}.rate`] = "Rate must be 0 or more";
    if (
      !isNum(it.vatPercentage) ||
      Number(it.vatPercentage) < 0 ||
      Number(it.vatPercentage) > 100
    )
      e[`${k}.vatPercentage`] = "VAT must be 0–100%";
  });
  if (items.length && computeTotals(items, 0).subtotal <= 0)
    e.items = "The quotation total can't be zero — add rates";

  (form.durations ?? []).forEach((d, i) => {
    if (!durationInUse(d)) return; // empty rows and untouched template rows are ignored
    if (blank(d.description)) e[`durations.${i}.description`] = "Description is required";
    if (!isNum(d.duration) || Number(d.duration) <= 0)
      e[`durations.${i}.duration`] = "Duration must be greater than 0";
  });

  if (!blank(form.discount)) {
    const { subtotal, salesTax } = computeTotals(items, 0);
    if (!isNum(form.discount) || Number(form.discount) < 0)
      e.discount = "Discount must be 0 or more";
    else if (Number(form.discount) > subtotal + salesTax)
      e.discount = "Discount can't exceed the total";
  }
  if (tooLong(form.detailedPaymentTerms, 2000))
    e.detailedPaymentTerms = "Keep it under 2000 characters";
  if (tooLong(form.termsAndConditions, 4000))
    e.termsAndConditions = "Keep it under 4000 characters";
  if (tooLong(form.internalRemarks, 2000))
    e.internalRemarks = "Keep it under 2000 characters";
  return e;
}
