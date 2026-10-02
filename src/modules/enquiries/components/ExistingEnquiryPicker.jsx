import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, ChevronRight, FilePlus2, Loader2, MapPin, Search, UserRound } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { FieldLabel, FormRow, Input } from "../../../shared/components/forms";
import { formatDate } from "../../../shared/utils";
import { StatusBadge } from "./StatusBadge";
import { canSearchExisting, useExistingEnquirySearch } from "../hooks/useExistingEnquirySearch";

const CARD = "rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800";

/**
 * "Existing customer": search previous enquiries by company name and/or contact
 * person, and pick one to copy the customer details from.
 */
export function ExistingEnquiryPicker({ initialCompany = "", initialContact = "", onSelect, onCreateNew, selecting = null }) {
  const [companyName, setCompanyName] = useState(initialCompany);
  const [contactPerson, setContactPerson] = useState(initialContact);
  const { results, status, error, search } = useExistingEnquirySearch();

  // Search straight away for names handed over from the new-enquiry form.
  // Deferred a tick so it never runs during render (and StrictMode's double
  // mount cancels the first one).
  useEffect(() => {
    if (!canSearchExisting({ companyName: initialCompany, contactPerson: initialContact })) return undefined;
    const t = setTimeout(() => search({ companyName: initialCompany, contactPerson: initialContact }, { immediate: true }), 0);
    return () => clearTimeout(t);
  }, [initialCompany, initialContact, search]);

  const update = (patch) => {
    const next = { companyName, contactPerson, ...patch };
    if ("companyName" in patch) setCompanyName(patch.companyName);
    if ("contactPerson" in patch) setContactPerson(patch.contactPerson);
    search(next);
  };

  return (
    <div className="space-y-4">
      <section className={CARD}>
        <p className="mb-1 text-sm font-semibold text-ink-900 dark:text-ink-50">Find the existing customer</p>
        <p className="mb-4 text-xs text-ink-400">Search previous enquiries by company name, contact person, or both — at least 2 characters.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search({ companyName, contactPerson }, { immediate: true });
          }}
        >
          <FormRow>
            <div>
              <FieldLabel>Company name</FieldLabel>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <Input autoFocus value={companyName} onChange={(e) => update({ companyName: e.target.value })} placeholder="e.g. Modern Architecture LLC" className="pl-9" />
              </div>
            </div>
            <div>
              <FieldLabel>Contact person</FieldLabel>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <Input value={contactPerson} onChange={(e) => update({ contactPerson: e.target.value })} placeholder="e.g. Adnan" className="pl-9" />
              </div>
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="secondary" disabled={!canSearchExisting({ companyName, contactPerson })}>
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </FormRow>
        </form>
      </section>

      {status === "loading" && (
        <div className="flex items-center gap-2 px-1 text-sm text-ink-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching…
        </div>
      )}
      {status === "error" && <p className="rounded-lg bg-signal-50 px-4 py-2.5 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">{error}</p>}

      {status === "done" && results.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink-200 px-6 py-10 text-center dark:border-ink-700">
          <p className="text-sm text-ink-500 dark:text-ink-400">No previous enquiry matches that company or contact person.</p>
          <Button size="sm" variant="secondary" onClick={() => onCreateNew({ companyName, contactPerson })}>
            <FilePlus2 className="h-4 w-4" />
            Register it as a new enquiry
          </Button>
        </div>
      )}

      {status === "done" && results.length > 0 && (
        <div className="space-y-2">
          <p className="px-1 text-xs font-medium text-ink-400">
            {results.length} previous enquir{results.length === 1 ? "y" : "ies"} — pick one to use its customer details
          </p>
          {results.map((e, i) => {
            const projects = e.projectInformations ?? [];
            const busy = selecting === e.id;
            return (
              <motion.button
                key={e.id}
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: Math.min(i, 6) * 0.03 }}
                onClick={() => onSelect(e)}
                disabled={selecting !== null}
                className="group flex w-full items-center gap-4 rounded-xl bg-white p-4 text-left ring-1 ring-ink-100 transition hover:ring-2 hover:ring-signal-500 disabled:opacity-60 dark:bg-ink-900 dark:ring-ink-800"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-ink-950 dark:text-white">{e.enquiryNo}</span>
                    <StatusBadge status={e.currentStatus} />
                    <span className="text-xs text-ink-400">{formatDate(e.dateOfEnquiry)}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-ink-700 dark:text-ink-200">
                    <span className="font-medium">{e.companyName}</span> · {e.contactPerson || e.customerName}
                  </p>
                  {projects.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {projects.map((p) => (
                        <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2 py-0.5 text-xs text-ink-600 ring-1 ring-inset ring-ink-100 dark:bg-ink-800 dark:text-ink-300 dark:ring-ink-700">
                          <MapPin className="h-3 w-3" />
                          {p.projectName}
                          <span className="text-ink-400">· {p.scopeOfServices?.length ?? 0}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {busy ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-ink-400" />
                ) : (
                  <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-signal-600 opacity-80 group-hover:opacity-100 dark:text-signal-400">
                    Use this customer
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
