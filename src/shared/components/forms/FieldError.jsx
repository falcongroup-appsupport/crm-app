/** Inline validation message shown under a field. Renders nothing when there's no error. */
export function FieldError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1 text-xs text-signal-600 dark:text-signal-400">
      {children}
    </p>
  );
}
