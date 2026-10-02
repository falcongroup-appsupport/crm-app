import { useCallback, useEffect, useState } from "react";
import { followUpApi } from "../api/followUp.api";
import { ApiError } from "../../../../shared/api/axiosInstance";

const PAGE_SIZE = 10;

/** Paged follow-up history for one quotation, plus a create action that refreshes it. */
export function useFollowUps(quotationId) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (target = 0) => {
      if (!quotationId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await followUpApi.getByQuotation(quotationId, {
          page: target,
          size: PAGE_SIZE,
        });
        setItems(Array.isArray(data) ? data : (data?.content ?? []));
        setTotalPages(data?.totalPages ?? 1);
        setPage(data?.number ?? target);
      } catch (err) {
        setItems([]);
        setError(
          err instanceof ApiError ? err.message : "Could not load follow-ups.",
        );
      } finally {
        setLoading(false);
      }
    },
    [quotationId],
  );

  useEffect(() => {
    load(0);
  }, [load]);

  const create = useCallback(
    async (body) => {
      const created = await followUpApi.create({ ...body, quotationId });
      await load(0);
      return created;
    },
    [quotationId, load],
  );

  return { items, page, totalPages, loading, error, goToPage: load, create };
}
