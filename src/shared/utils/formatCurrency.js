// Money with two decimals in the given currency (quotation values are exact amounts).
export function formatCurrency(value, currency = "AED") {
  if (value === null || value === undefined || value === "") return "—";
  try {
    return new Intl.NumberFormat("en-AE", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value));
  } catch {
    return `${currency} ${Number(value).toFixed(2)}`;
  }
}
