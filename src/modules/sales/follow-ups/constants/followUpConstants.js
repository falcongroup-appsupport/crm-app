// Only PHONE and MORE_FOLLOW_UP appear in CRM_APIS.pdf. The other values are
// reasonable guesses so the dropdowns aren't a single option — replace them
// with the backend's real enums.
export const FOLLOW_UP_TYPES = ["PHONE", "EMAIL", "MEETING", "WHATSAPP"];

export const FOLLOW_UP_STATUSES = [
  { value: "MORE_FOLLOW_UP", label: "More follow-up" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "ON_HOLD", label: "On hold" },
  { value: "REJECTED", label: "Rejected" },
];

export const FOLLOW_UP_STATUS_LABEL = Object.fromEntries(
  FOLLOW_UP_STATUSES.map((s) => [s.value, s.label]),
);
