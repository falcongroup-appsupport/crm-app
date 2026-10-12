import { useCallback, useEffect, useState } from "react";
import { quotationApi } from "../api/quotation.api";
import { ApiError } from "../../../../shared/api/axiosInstance";

/**
 * Quotations for one enquiry. The endpoint may return one object, an array or
 * 404 when there are none — all normalised to an array here.
 */
export function useEnquiryQuotations(enquiryId) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quotationApi.getByEnquiry(enquiryId);
      const list = Array.isArray(data)
        ? data
        : data && typeof data === "object" && Object.keys(data).length
          ? [data]
          : [];
      setQuotations(list);
    } catch (err) {
      setQuotations([]);
      if (!(err instanceof ApiError && err.status === 404))
        setError(err instanceof ApiError ? err.message : "Could not load quotations.");
    } finally {
      setLoading(false);
    }
  }, [enquiryId]);

  useEffect(() => {
    load();
  }, [load]);

  return { quotations, loading, error, refresh: load };
}
