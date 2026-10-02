import { useEffect, useState } from "react";
import { paymentTermApi } from "../api/paymentTerm.api";

// The payment-terms response shape isn't documented — these helpers accept the
// usual field-name variants. Adjust once a real response is known.
export const termLabel = (t) =>
  t?.name ??
  t?.title ??
  t?.paymentTerm ??
  t?.termName ??
  t?.label ??
  `Term #${t?.id}`;
export const termDetails = (t) =>
  t?.detailedPaymentTerms ?? t?.description ?? t?.details ?? t?.terms ?? "";

export function usePaymentTerms() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    paymentTermApi
      .getActive()
      .then(
        (data) =>
          !cancelled &&
          setTerms(Array.isArray(data) ? data : (data?.content ?? [])),
      )
      .catch(() => !cancelled && setTerms([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { terms, loading };
}
