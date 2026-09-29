export function FieldLabel({ children, required }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-300">
      {children}
      {required && <span className="ml-0.5 text-signal-500">*</span>}
    </label>
  );
}
