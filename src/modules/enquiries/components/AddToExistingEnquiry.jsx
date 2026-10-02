import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, FolderPlus } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { FieldError } from "../../../shared/components/forms";
import { FileUpload } from "../../../shared/components/forms/FileUpload";
import { ApiError } from "../../../shared/api/axiosInstance";
import { useActivities } from "../../masters/activities/hooks/useActivities";
import { enquiryApi } from "../api/enquiry.api";
import { ATTACHMENT_TYPES } from "../constants/enquiryStatus";
import {
  emptyProject,
  existingEnquiryPayload,
  validateNewProjects,
} from "../schemas/enquiry.schema";
import { ExistingEnquiryPicker } from "./ExistingEnquiryPicker";
import { ExistingEnquirySummary } from "./ExistingEnquirySummary";
import { ProjectInformationBlock } from "./ProjectInformationBlock";

const MAX_FILE_MB = Number(import.meta.env.VITE_MAX_UPLOAD_MB) || 0;
const MAX_REQUEST_MB = Number(import.meta.env.VITE_MAX_REQUEST_MB) || 0;
const CARD =
  "rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800";

/**
 * "Add to existing" on the Add Enquiry page: find an enquiry by company and/or
 * customer, then add new project(s) to it via POST /api/enquiry/save with
 * enquiryType EXISTING + selectedEnquiryId.
 */
export function AddToExistingEnquiry({ initialSearch = {}, onSwitchToNew }) {
  const navigate = useNavigate();
  const { activities } = useActivities();

  const [selected, setSelected] = useState(null); // full GET /api/enquiry/{id} record
  const [selectingId, setSelectingId] = useState(null);
  const [pickError, setPickError] = useState(null);
  const [lastSearch, setLastSearch] = useState(initialSearch);

  const [projects, setProjects] = useState([emptyProject()]);
  const [files, setFiles] = useState([]);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const errors = useMemo(
    () =>
      attempted && selected
        ? validateNewProjects(selected, projects, {
            files,
            maxFileMB: MAX_FILE_MB,
            maxRequestMB: MAX_REQUEST_MB,
          })
        : {},
    [attempted, selected, projects, files],
  );
  const errorCount = Object.keys(errors).length;
  const activityCount = projects.reduce(
    (n, p) => n + (p.scopeOfServices?.length ?? 0),
    0,
  );

  const select = async (row) => {
    setPickError(null);
    setSelectingId(row.id);
    setLastSearch({
      companyName: row.companyName ?? "",
      customerName: row.customerName ?? "",
    });
    try {
      setSelected(await enquiryApi.getById(row.id)); // full record (contact, email, site visit…)
      setProjects([emptyProject()]);
      setFiles([]);
      setAttempted(false);
      setSubmitError(null);
    } catch (err) {
      setPickError(
        err instanceof ApiError ? err.message : "Could not load that enquiry.",
      );
    } finally {
      setSelectingId(null);
    }
  };

  const submit = async () => {
    setAttempted(true);
    setSubmitError(null);
    const found = validateNewProjects(selected, projects, {
      files,
      maxFileMB: MAX_FILE_MB,
      maxRequestMB: MAX_REQUEST_MB,
    });
    if (Object.keys(found).length) {
      setTimeout(() => {
        const first = document.querySelector('[aria-invalid="true"]');
        first?.scrollIntoView({ behavior: "smooth", block: "center" });
        first?.focus({ preventScroll: true });
      }, 0);
      return;
    }
    setSaving(true);
    try {
      await enquiryApi.save(existingEnquiryPayload(selected, projects, files));
      navigate(`/enquiries/${selected.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Could not add the project.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!selected) {
    return (
      <div className="space-y-4">
        {pickError && (
          <p className="rounded-lg bg-signal-50 px-4 py-2.5 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
            {pickError}
          </p>
        )}
        <ExistingEnquiryPicker
          initialCompany={lastSearch.companyName ?? ""}
          initialCustomer={lastSearch.customerName ?? ""}
          onSelect={select}
          onCreateNew={onSwitchToNew}
          selecting={selectingId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <ExistingEnquirySummary
        enquiry={selected}
        onChange={() => setSelected(null)}
      />

      {errorCount > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {errorCount === 1
              ? "1 field needs attention"
              : `${errorCount} fields need attention`}{" "}
            — they're highlighted below.
          </span>
        </div>
      )}

      <section className={CARD}>
        <p className="mb-4 text-sm font-semibold text-ink-900 dark:text-ink-50">
          New project{projects.length > 1 ? "s" : ""}
        </p>
        <div className="space-y-4">
          {projects.map((project, i) => (
            <ProjectInformationBlock
              key={i}
              index={i}
              project={project}
              activities={activities}
              onChange={(p) =>
                setProjects((list) => list.map((x, j) => (j === i ? p : x)))
              }
              onRemove={() =>
                setProjects((list) => list.filter((_, j) => j !== i))
              }
              removable={projects.length > 1}
              errors={errors}
            />
          ))}
        </div>
        <FieldError>{errors.projects}</FieldError>
        <button
          type="button"
          onClick={() => setProjects((list) => [...list, emptyProject()])}
          className="mt-4 w-full rounded-lg bg-ink-950 py-2.5 text-sm font-medium text-white hover:bg-signal-600 dark:ring-1 dark:ring-ink-700"
        >
          + Add another project
        </button>
      </section>

      <section className={CARD}>
        <p className="mb-4 text-sm font-semibold text-ink-900 dark:text-ink-50">
          Attachments for the new project(s)
        </p>
        <FileUpload
          files={files}
          onChange={setFiles}
          defaultType="DRAWING"
          typeOptions={ATTACHMENT_TYPES}
          maxSizeMB={MAX_FILE_MB}
        />
        <FieldError>{errors.attachments}</FieldError>
      </section>

      {submitError && (
        <p className="rounded-lg bg-signal-50 px-4 py-2.5 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
          {submitError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Adds {projects.length} project{projects.length > 1 ? "s" : ""} ·{" "}
          {activityCount} activit{activityCount === 1 ? "y" : "ies"} to{" "}
          <span className="font-mono font-medium text-ink-800 dark:text-ink-100">
            {selected.enquiryNo}
          </span>
        </p>
        <Button onClick={submit} disabled={saving}>
          <FolderPlus className="h-4 w-4" />
          {saving ? "Adding…" : "Add to enquiry"}
        </Button>
      </div>
    </div>
  );
}
