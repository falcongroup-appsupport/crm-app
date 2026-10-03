import { API_BASE_URL } from "../../api/axiosInstance";
import { ErrorToast } from "./toast/ErrorToast";

/**
 * Backend unreachable → a persistent error toast with Retry (one per app, even
 * if several pages report it). Kept under the old name so every page using
 * <ConnectionBanner connected onRetry /> switched to toasts without changes.
 */
export function ConnectionBanner({ connected, onRetry }) {
  return (
    <ErrorToast
      error={
        connected
          ? null
          : `The API at ${API_BASE_URL} isn't responding. Check the backend is running.`
      }
      title="Can't reach the server"
      onRetry={onRetry}
      persist
    />
  );
}
