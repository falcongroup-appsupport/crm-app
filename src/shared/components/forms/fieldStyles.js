// Shared Tailwind classes for every form control, so Input/Select/Textarea
// stay visually identical without each redefining the same string.
// aria-invalid="true" turns the ring red (set it from validation errors).
export const fieldBase =
  "w-full rounded-lg border-0 bg-ink-50 px-3.5 py-2.5 text-sm text-ink-900 ring-1 ring-inset ring-ink-100 placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-signal-500 transition-colors disabled:opacity-50 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-signal-500 dark:bg-ink-800 dark:text-ink-50 dark:ring-ink-700 dark:placeholder:text-ink-500 dark:focus:bg-ink-900 dark:aria-[invalid=true]:ring-signal-500";
