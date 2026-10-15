const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
const SCALES = [
  [1_000_000_000, "Billion"],
  [1_000_000, "Million"],
  [1_000, "Thousand"],
];

function below1000(n) {
  const parts = [];
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`);
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : ""));
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(" ");
}

function integerToWords(n) {
  if (n === 0) return "Zero";
  const parts = [];
  for (const [value, name] of SCALES) {
    if (n >= value) {
      parts.push(`${below1000(Math.floor(n / value))} ${name}`);
      n %= value;
    }
  }
  if (n > 0) parts.push(below1000(n));
  return parts.join(" ");
}

const CURRENCY_WORDS = {
  AED: ["Dirhams", "Fils"],
  USD: ["Dollars", "Cents"],
  EUR: ["Euros", "Cents"],
  SAR: ["Riyals", "Halalas"],
  QAR: ["Riyals", "Dirhams"],
};

/** 1260 → "Dirhams One Thousand Two Hundred Sixty only" */
export function amountInWords(value, currency = "AED") {
  const amount = Math.round(Math.abs(Number(value) || 0) * 100);
  const whole = Math.floor(amount / 100);
  const minor = amount % 100;
  const [major, sub] = CURRENCY_WORDS[currency] ?? [currency, "Cents"];
  let words = `${major} ${integerToWords(whole)}`;
  if (minor) words += ` and ${sub} ${integerToWords(minor)}`;
  return `${words} only`;
}
