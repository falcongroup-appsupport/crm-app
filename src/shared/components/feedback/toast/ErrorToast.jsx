import { useEffect } from "react";
import { useToast } from "./useToast";

/**
 * Declarative error toast for load / connection failures: renders nothing and
 * raises an error toast whenever `error` becomes truthy (once per distinct
 * error — the key de-duplicates it), with an optional Retry action. When the
 * error clears, the toast closes.
 *
 *   <ErrorToast error={error} title="Couldn't load templates" onRetry={refresh} />
 */
export function ErrorToast({ error, title, onRetry, persist = false }) {
  const toast = useToast();
  const message =
    typeof error === "string" ? error : error ? "Something went wrong." : null;
  const key = message ? `error:${title}:${message}` : null;

  useEffect(() => {
    if (!key) return undefined;
    toast.error(title, {
      key,
      description: message,
      duration: persist ? 0 : undefined,
      action: onRetry ? { label: "Retry", onClick: onRetry } : undefined,
    });
    return () => toast.dismissKey(key); // error resolved / page left → close it
  }, [key, title, message, persist, onRetry, toast]);

  return null;
}
