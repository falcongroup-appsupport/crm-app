import { useEffect, useState } from "react";

/**
 * Renders `quotation` to a PDF blob URL, debounced, for an <iframe> preview.
 * Pass `enabled=false` to skip rendering (preview closed).
 */
export function usePdfPreview(quotation, enabled, delay = 900) {
  const [url, setUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    let made = null;
    const timer = setTimeout(async () => {
      setBusy(true);
      try {
        const { renderQuotationPdf } = await import("../pdf/downloadQuotationPdf");
        const blob = await renderQuotationPdf(quotation);
        if (cancelled) return;
        made = URL.createObjectURL(blob);
        setUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return made;
        });
        setError(null);
      } catch {
        if (!cancelled) setError("Couldn't render the preview.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [quotation, enabled, delay]);

  useEffect(
    () => () => {
      setUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return null;
      });
    },
    [],
  );

  return { url: enabled ? url : null, busy, error };
}
