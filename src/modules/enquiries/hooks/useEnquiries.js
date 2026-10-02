import { useCallback, useEffect, useMemo, useState } from "react";
import { enquiryApi } from "../api/enquiry.api";
import { ApiError } from "../../../shared/api/axiosInstance";

const PAGE_SIZE = 10;

export function useEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  // Client-only overlay for actions the backend doesn't expose yet
  // (Close Enquiry has no documented status/endpoint) — merged in below.
  const [localOverlay, setLocalOverlay] = useState({});

  const load = useCallback(async (targetPage = 0) => {
    setLoading(true);
    setError(null);
    try {
      const data = await enquiryApi.getAll({
        page: targetPage,
        size: PAGE_SIZE,
      });
      setEnquiries(Array.isArray(data?.content) ? data.content : []);
      setTotalPages(data?.totalPages ?? 1);
      setPage(data?.number ?? targetPage);
      setConnected(true);
    } catch (err) {
      setConnected(false);
      setError(
        err instanceof ApiError
          ? err.message
          : "Unexpected error loading enquiries",
      );
      setEnquiries([]);
      setTotalPages(1);
      setPage(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  const withOverlay = useMemo(
    () => enquiries.map((e) => ({ ...e, ...localOverlay[e.id] })),
    [enquiries, localOverlay],
  );

  const createEnquiry = useCallback(
    async (payload) => {
      // NEW by default; the add-to-existing flow passes enquiryType EXISTING + selectedEnquiryId
      const result = await enquiryApi.save({ enquiryType: "NEW", ...payload });
      await load(page);
      return result;
    },
    [load, page],
  );

  const updateEnquiry = useCallback(
    async (id, payload) => {
      const result = await enquiryApi.update(id, payload);
      await load(page);
      return result;
    },
    [load, page],
  );

  const deleteEnquiry = useCallback(
    async (id) => {
      await enquiryApi.remove(id);
      await load(page);
    },
    [load, page],
  );

  // Optimistic: the badge updates immediately, then only { currentStatus } is
  // sent (form-data update is partial). Reverts if the call fails.
  const changeStatus = useCallback(
    async (id, currentStatus) => {
      const previous =
        enquiries.find((e) => e.id === id)?.currentStatus ?? null;
      const apply = (value) =>
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, currentStatus: value } : e)),
        );
      apply(currentStatus);
      try {
        await enquiryApi.update(id, { currentStatus });
      } catch (err) {
        apply(previous);
        throw err;
      }
    },
    [enquiries],
  );

  // Local-only until a "close enquiry" endpoint exists.
  const closeEnquiryLocally = useCallback((id, remarks) => {
    setLocalOverlay((prev) => ({
      ...prev,
      [id]: { closedLocally: true, closeRemarks: remarks },
    }));
  }, []);

  const setSiteVisit = useCallback(
    async (id, siteVisit) => {
      await updateEnquiry(id, {
        siteVisit,
        currentStatus: "SITE_VISIT_REQUIRED",
      });
    },
    [updateEnquiry],
  );

  return {
    enquiries: withOverlay,
    loading,
    connected,
    error,
    page,
    totalPages,
    goToPage: load,
    refresh: () => load(page),
    createEnquiry,
    updateEnquiry,
    deleteEnquiry,
    changeStatus,
    closeEnquiryLocally,
    setSiteVisit,
  };
}
