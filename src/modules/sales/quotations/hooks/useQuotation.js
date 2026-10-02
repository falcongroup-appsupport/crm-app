import { useCallback, useEffect, useState } from "react";
import { quotationApi } from "../api/quotation.api";
import { ApiError } from "../../../../shared/api/axiosInstance";

export function useQuotation(id) {
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQuotation(await quotationApi.getById(id));
    } catch (err) {
      setQuotation(null);
      setError(
        err instanceof ApiError ? err.message : "Could not load the quotation.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { quotation, loading, error, refresh: load };
}
