import { useCallback, useEffect, useState } from "react";
import { quotationTemplateApi } from "../api/quotationTemplate.api";
import { ApiError } from "../../../../shared/api/axiosInstance";

const PAGE_SIZE = 20;

export function useQuotationTemplates({ activeOnly = false } = {}) {
  const [templates, setTemplates] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (target = 0) => {
      setLoading(true);
      setError(null);
      try {
        const fn = activeOnly
          ? quotationTemplateApi.getActive
          : quotationTemplateApi.getAll;
        const data = await fn({ page: target, size: PAGE_SIZE });
        setTemplates(Array.isArray(data) ? data : (data?.content ?? []));
        setTotalPages(data?.totalPages ?? 1);
        setPage(data?.number ?? target);
      } catch (err) {
        setTemplates([]);
        setError(
          err instanceof ApiError ? err.message : "Could not load templates.",
        );
      } finally {
        setLoading(false);
      }
    },
    [activeOnly],
  );

  useEffect(() => {
    load(0);
  }, [load]);

  const create = useCallback(
    async (data) => {
      await quotationTemplateApi.create(data);
      await load(page);
    },
    [load, page],
  );
  const update = useCallback(
    async (id, data) => {
      await quotationTemplateApi.update(id, data);
      await load(page);
    },
    [load, page],
  );
  const remove = useCallback(
    async (id) => {
      await quotationTemplateApi.remove(id);
      await load(page);
    },
    [load, page],
  );

  return {
    templates,
    page,
    totalPages,
    loading,
    error,
    goToPage: load,
    refresh: () => load(page),
    create,
    update,
    remove,
  };
}
