// Not currently wired to any screen (the enquiry model dropped estimated
// value), kept for the next module that needs money formatting.
const currencyFormatter = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 0,
});

export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  return currencyFormatter.format(Number(value));
}
