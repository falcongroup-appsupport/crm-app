import { DEFAULT_DURATION_DESCRIPTIONS, DEFAULT_VAT_PERCENTAGE } from "../constants/quotationConstants";

const str = (v) => (v === null || v === undefined ? "" : v);
const num = (v) => (v === "" || v === null || v === undefined || Number.isNaN(Number(v)) ? 0 : Number(v));
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

export const emptyDuration = (description = "") => ({ description, unit: "Days", duration: "", remarks: "" });

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
  return { subtotal, salesTax, discount: disc, total: round2(subtotal + salesTax - disc) };
}

export function computeTotalDays(durations) {
  return round2(durations.reduce((s, d) => s + num(d.duration) * (d.unit === "Weeks" ? 7 : 1), 0));
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
    quotationDate: new Date().toISOString().slice(0, 10),
    quotationValidity: 30,
    currency: "AED",
    customerName: enquiry?.companyName || enquiry?.customerName || "",
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
    customerAddress: Object.fromEntries(Object.keys(emptyAddress()).map((k) => [k, str(q?.customerAddress?.[k])])),
    items: q?.items?.length
      ? q.items.map((it) => ({ ...it, activityId: str(it.activityId), activityName: str(it.activityName), itemDescription: str(it.itemDescription), unit: it.unit || "LS", quantity: it.quantity ?? 1, rate: it.rate ?? 0, vatPercentage: it.vatPercentage ?? DEFAULT_VAT_PERCENTAGE }))
      : [emptyItem()],
    durations: q?.durations?.length
      ? q.durations.map((d) => ({ ...d, description: str(d.description), unit: d.unit || "Days", duration: str(d.duration), remarks: str(d.remarks) }))
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
  const durations = form.durations.map((d, i) => ({
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
    selectedActivityIds: [...new Set(items.map((i) => i.activityId).filter((v) => v !== null))],
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
