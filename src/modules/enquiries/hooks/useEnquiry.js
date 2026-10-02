import { useCallback, useEffect, useState } from "react";
import { enquiryApi } from "../api/enquiry.api";
import { ApiError } from "../../../shared/api/axiosInstance";

/** Loads a single enquiry by id — used by both the Edit and Details pages. */
export function useEnquiry(id, { enabled = true } = {}) {
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await enquiryApi.getById(id);
      setEnquiry(data);
    } catch (err) {
      setEnquiry(null);
      setError(
        err instanceof ApiError ? err.message : "Could not load this enquiry.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { enquiry, loading, error, refresh: load };
}
