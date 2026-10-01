import { useCallback, useEffect, useState } from "react";
import { quotationApi } from "../api/quotation.api";
import { ApiError } from "../../../../shared/api/axiosInstance";

/** Loads the quotation (if any) for an enquiry. `notFound` means none exists yet. */
export function useEnquiryQuotation(enquiryId) {
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await quotationApi.getByEnquiry(enquiryId);
      const found = Array.isArray(data) ? data[0] : data;
      if (!found || (typeof found === "object" && Object.keys(found).length === 0)) {
        setQuotation(null);
        setNotFound(true);
      } else {
        setQuotation(found);
      }
    } catch (err) {
      setQuotation(null);
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
      else setError(err instanceof ApiError ? err.message : "Could not load the quotation.");
    } finally {
      setLoading(false);
    }
  }, [enquiryId]);

  useEffect(() => {
    load();
  }, [load]);

  return { quotation, loading, error, notFound, refresh: load };
}
