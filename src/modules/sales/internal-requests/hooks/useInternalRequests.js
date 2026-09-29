import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "survey-crm.internal-requests.v1";
let seq = 1;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      seq = (parsed.reduce((max, r) => Math.max(max, r.seq || 0), 0) || 0) + 1;
      return parsed;
    }
  } catch {
    // ignore corrupt storage
  }
  return [];
}

export function useInternalRequests() {
  const [requests, setRequests] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch {
      // storage may be unavailable — requests still work in-memory for this session
    }
  }, [requests]);

  const createRequest = useCallback((data) => {
    const now = new Date().toISOString();
    const record = {
      id: `local-${Date.now()}`,
      seq: seq++,
      requestNumber: `RQST-${String(seq).padStart(3, "0")}/${new Date().getFullYear().toString().slice(-2)}`,
      creationDate: now,
      currentStatus: "OPEN",
      requestedBy: "Ansil Rahman",
      ...data,
    };
    setRequests((prev) => [record, ...prev]);
    return record;
  }, []);

  const updateRequest = useCallback((id, patch) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const cancelRequest = useCallback((id, reason) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, currentStatus: "CANCELLED", cancellationReason: reason } : r)),
    );
  }, []);

  return { requests, createRequest, updateRequest, cancelRequest };
}
