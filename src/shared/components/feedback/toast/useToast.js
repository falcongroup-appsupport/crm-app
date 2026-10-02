import { useContext } from "react";
import { ToastContext } from "./toastContext";

/**
 * const toast = useToast();
 * toast.success("Enquiry saved", { description: "FSEC-26-ENQ-0013" });
 * toast.error("Couldn't save", { description: err.message });
 * toast.info(...) · toast.warning(...) · toast.dismiss(id)
 * Options: description, duration (ms, 0 = stays until closed), action: { label, onClick }
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
