import { useCallback, useEffect, useRef, useState } from "react";
import { enquiryApi } from "../api/enquiry.api";
import { ApiError } from "../../../shared/api/axiosInstance";

const MIN_CHARS = 2;
export const canSearchExisting = ({ companyName = "", contactPerson = "" }) =>
  companyName.trim().length >= MIN_CHARS ||
  contactPerson.trim().length >= MIN_CHARS;

/**
 * Debounced POST /api/enquiry/search-existing. Call `search({ companyName, contactPerson })`
 * from change handlers; stale responses are ignored so results always match
 * the latest input.
 */
export function useExistingEnquirySearch({ delay = 350 } = {}) {
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState(null);
  const timer = useRef(null);
  const latest = useRef(0);

  const run = useCallback(async (params) => {
    const ticket = ++latest.current;
    setStatus("loading");
    setError(null);
    try {
      const data = await enquiryApi.searchExisting(params);
      if (ticket !== latest.current) return;
      setResults(Array.isArray(data) ? data : (data?.content ?? []));
      setStatus("done");
    } catch (err) {
      if (ticket !== latest.current) return;
      setResults([]);
      setError(err instanceof ApiError ? err.message : "Search failed.");
      setStatus("error");
    }
  }, []);

  const search = useCallback(
    (params, { immediate = false } = {}) => {
      clearTimeout(timer.current);
      if (!canSearchExisting(params)) {
        latest.current += 1; // drop any in-flight result
        setResults([]);
        setStatus("idle");
        return;
      }
      if (immediate) run(params);
      else timer.current = setTimeout(() => run(params), delay);
    },
    [run, delay],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { results, status, error, search };
}
