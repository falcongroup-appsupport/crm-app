import { useCallback, useEffect, useState } from "react";
import { quotationApi } from "../api/quotation.api";
import { ApiError } from "../../../../shared/api/axiosInstance";

const asList = (data) => (Array.isArray(data) ? data : (data?.content ?? []));
const newestFirst = (a, b) =>
  String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")) ||
  (b.id ?? 0) - (a.id ?? 0);

/** Every quotation (GET /api/quotation), newest first. */
export function useQuotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQuotations(asList(await quotationApi.getAll()).sort(newestFirst));
    } catch (err) {
      setQuotations([]);
      setError(err instanceof ApiError ? err.message : "Could not load quotations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { quotations, loading, error, refresh: load };
}
