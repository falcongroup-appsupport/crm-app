import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, ChevronLeft, Save, RotateCcw } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import {
  FieldLabel,
  FieldError,
  Input,
  Select,
  Textarea,
  FormRow,
} from "../../../shared/components/forms";
import { FileUpload } from "../../../shared/components/forms/FileUpload";
import { ConnectionBanner } from "../../../shared/components/feedback/ConnectionBanner";
import { Loader } from "../../../shared/components/feedback/Loader";
import { ProjectInformationBlock } from "./ProjectInformationBlock";
import { SiteVisitFormSection } from "./SiteVisitFormSection";
import { useActivities } from "../../masters/activities/hooks/useActivities";
import { useEnquiries } from "../hooks/useEnquiries";
import { useEnquiry } from "../hooks/useEnquiry";
import { ApiError } from "../../../shared/api/axiosInstance";
import {
  emptyEnquiry,
  emptyProject,
  normalizeEnquiry,
  validateEnquiry,
} from "../schemas/enquiry.schema";
import {
  ATTACHMENT_TYPES,
  CURRENT_STATUSES,
  ENQUIRY_SOURCES,
  PROJECT_LEADS,
  PROJECT_STATUSES,
} from "../constants/enquiryStatus";

// Optional client-side upload limits (MB). 0 = let the server decide.
// Set them to the backend's multipart limits so oversized files are caught
// in the form instead of coming back as HTTP 413.
const MAX_FILE_MB = Number(import.meta.env.VITE_MAX_UPLOAD_MB) || 0;
const MAX_REQUEST_MB = Number(import.meta.env.VITE_MAX_REQUEST_MB) || 0;

const CARD =
  "rounded-xl bg-white p-5 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800";
const TITLE = "mb-4 text-sm font-semibold text-ink-900 dark:text-ink-50";

const mb = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

function describeUpload(files) {
  const real = files.map((f) => f.file).filter(Boolean);
  if (!real.length) return null;
  const total = real.reduce((s, f) => s + f.size, 0);
  const largest = real.reduce((a, b) => (b.size > a.size ? b : a));
  return { count: real.length, total, largest };
}

export function EnquiryForm({ mode, id }) {
  const navigate = useNavigate();
  const { activities } = useActivities();
  const { createEnquiry, updateEnquiry, connected, refresh } = useEnquiries();
  const {
    enquiry,
    loading,
    error: loadError,
  } = useEnquiry(id, { enabled: mode === "edit" });

  const [form, setForm] = useState(emptyEnquiry);
  const [permitFiles, setPermitFiles] = useState([]);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (mode === "edit" && enquiry) setForm(normalizeEnquiry(enquiry));
  }, [mode, enquiry]);

  const allFiles = useMemo(
    () => [
      ...form.attachments,
      ...permitFiles.map((f) => ({ ...f, fileType: "PERMIT" })),
    ],
    [form.attachments, permitFiles],
  );

  // Validation runs on submit, then live on every change so fixed fields clear immediately.
  const errors = useMemo(
    () =>
      attempted
        ? validateEnquiry(form, {
            mode,
            files: allFiles,
            maxFileMB: MAX_FILE_MB,
            maxRequestMB: MAX_REQUEST_MB,
          })
        : {},
    [attempted, form, mode, allFiles],
  );
  const errorCount = Object.keys(errors).length;
  const upload = describeUpload(allFiles);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const updateProject = (index, project) =>
    setForm((f) => ({
      ...f,
      projectInformations: f.projectInformations.map((p, i) =>
        i === index ? project : p,
      ),
    }));
  const addProject = () =>
    set({ projectInformations: [...form.projectInformations, emptyProject()] });
  const removeProject = (index) =>
    set({
      projectInformations: form.projectInformations.filter(
        (_, i) => i !== index,
      ),
    });

  const handleReset = () => {
    if (mode === "edit") return; // reset only makes sense for a fresh registration
    setForm(emptyEnquiry());
    setPermitFiles([]);
    setAttempted(false);
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setAttempted(true);

    const found = validateEnquiry(form, {
      mode,
      files: allFiles,
      maxFileMB: MAX_FILE_MB,
      maxRequestMB: MAX_REQUEST_MB,
    });
    if (Object.keys(found).length) {
      // wait for the red rings to render, then bring the first one into view
      setTimeout(() => {
        const first = document.querySelector('[aria-invalid="true"]');
        first?.scrollIntoView({ behavior: "smooth", block: "center" });
        first?.focus({ preventScroll: true });
      }, 0);
      return;
    }

    setSaving(true);
    const payload = { ...form, attachments: allFiles };
    // Site visit is optional: on edit, only send it when it's required now or
    // an existing one is being switched off.
    if (
      mode === "edit" &&
      !form.siteVisit?.siteVisitRequired &&
      !enquiry?.siteVisit?.siteVisitRequired
    ) {
      delete payload.siteVisit;
    }
    try {
      if (mode === "edit") {
        await updateEnquiry(id, payload);
        navigate(`/enquiries/${id}`);
      } else {
        const created = await createEnquiry(payload);
        navigate(created?.id ? `/enquiries/${created.id}` : "/enquiries");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 413 && upload) {
        setSubmitError(
          `The server rejected the attachments as too large (HTTP 413): ${upload.count} file${upload.count > 1 ? "s" : ""}, ` +
            `${mb(upload.total)} in total, largest "${upload.largest.name}" at ${mb(upload.largest.size)}. ` +
            "The backend's upload limit is lower than this — raise spring.servlet.multipart.max-file-size and max-request-size " +
            "(and client_max_body_size if nginx is in front), or attach smaller files.",
        );
      } else {
        setSubmitError(
          err instanceof ApiError ? err.message : "Could not save the enquiry.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (mode === "edit" && loading) return <Loader label="Loading enquiry…" />;

  if (mode === "edit" && loadError) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-8">
        <p className="rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
          {loadError}
        </p>
        <Link
          to="/enquiries"
          className="text-sm font-medium text-signal-600 hover:text-signal-700"
        >
          Back to enquiries
        </Link>
      </div>
    );
  }

  const invalid = (key) => Boolean(errors[key]);

  return (
    <div className="space-y-6 pb-16">
      <ConnectionBanner connected={connected} onRetry={refresh} />

      <div className="flex items-center gap-3">
        <Link
          to="/enquiries"
          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-950 dark:text-white">
            {mode === "edit" ? "Edit enquiry" : "Enquiry registration"}
          </h1>
          <p className="font-mono text-sm text-ink-400">
            {mode === "edit"
              ? form.enquiryNo
              : "Enquiry number will be generated automatically on save"}
          </p>
        </div>
      </div>

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

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <section className={CARD}>
          <p className={TITLE}>Customer / Client details</p>
          <FormRow>
            <div>
              <FieldLabel required>Company name</FieldLabel>
              <Input
                value={form.companyName}
                aria-invalid={invalid("companyName")}
                onChange={(e) => set({ companyName: e.target.value })}
                placeholder="Falcon Group"
              />
              <FieldError>{errors.companyName}</FieldError>
            </div>
            <div>
              <FieldLabel required>Customer / Client name</FieldLabel>
              <Input
                value={form.customerName}
                aria-invalid={invalid("customerName")}
                onChange={(e) => set({ customerName: e.target.value })}
              />
              <FieldError>{errors.customerName}</FieldError>
            </div>
            <div>
              <FieldLabel>Contact person</FieldLabel>
              <Input
                value={form.contactPerson}
                aria-invalid={invalid("contactPerson")}
                onChange={(e) => set({ contactPerson: e.target.value })}
              />
              <FieldError>{errors.contactPerson}</FieldError>
            </div>
            <div>
              <FieldLabel>Contact number</FieldLabel>
              <Input
                type="tel"
                value={form.contactNumber}
                aria-invalid={invalid("contactNumber")}
                onChange={(e) => set({ contactNumber: e.target.value })}
                placeholder="+971 5X XXX XXXX"
              />
              <FieldError>{errors.contactNumber}</FieldError>
            </div>
            <div>
              <FieldLabel>Customer / Client email</FieldLabel>
              <Input
                type="email"
                value={form.customerEmail}
                aria-invalid={invalid("customerEmail")}
                onChange={(e) => set({ customerEmail: e.target.value })}
                placeholder="name@company.com"
              />
              <FieldError>{errors.customerEmail}</FieldError>
            </div>
          </FormRow>
        </section>

        <section className={CARD}>
          <p className={TITLE}>Enquiry details</p>
          <FormRow>
            <div>
              <FieldLabel>Created at</FieldLabel>
              <Input
                disabled
                value={
                  form.createdAt
                    ? new Date(form.createdAt).toLocaleString()
                    : "Automated on save"
                }
              />
            </div>
            <div>
              <FieldLabel required>Enquiry date</FieldLabel>
              <Input
                type="date"
                value={form.dateOfEnquiry}
                aria-invalid={invalid("dateOfEnquiry")}
                onChange={(e) => set({ dateOfEnquiry: e.target.value })}
              />
              <FieldError>{errors.dateOfEnquiry}</FieldError>
            </div>
            <div>
              <FieldLabel>Enquiry source</FieldLabel>
              <Select
                value={form.source}
                onChange={(e) => set({ source: e.target.value })}
              >
                {ENQUIRY_SOURCES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-ink-400">
                Not saved yet — the API has no source field.
              </p>
            </div>
            <div>
              <FieldLabel>Enquiry lead</FieldLabel>
              <Input
                list="project-leads"
                value={form.projectLead}
                aria-invalid={invalid("projectLead")}
                onChange={(e) => set({ projectLead: e.target.value })}
                placeholder="No Lead"
              />
              <datalist id="project-leads">
                {PROJECT_LEADS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
              <FieldError>{errors.projectLead}</FieldError>
            </div>
            <div>
              <FieldLabel>Submission deadline</FieldLabel>
              <Input
                type="date"
                min={form.dateOfEnquiry || undefined}
                value={form.submissionDeadline || ""}
                aria-invalid={invalid("submissionDeadline")}
                onChange={(e) => set({ submissionDeadline: e.target.value })}
              />
              <FieldError>{errors.submissionDeadline}</FieldError>
            </div>
            <div>
              <FieldLabel>Project reference</FieldLabel>
              <Input
                value={form.projectReference}
                aria-invalid={invalid("projectReference")}
                onChange={(e) => set({ projectReference: e.target.value })}
                placeholder="REF-100"
              />
              <FieldError>{errors.projectReference}</FieldError>
            </div>
            <div>
              <FieldLabel required={mode === "create"}>
                Project status
              </FieldLabel>
              <Select
                value={form.projectStatus || ""}
                aria-invalid={invalid("projectStatus")}
                onChange={(e) => set({ projectStatus: e.target.value })}
              >
                <option value="">Not set</option>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
              <FieldError>{errors.projectStatus}</FieldError>
            </div>
            {mode === "edit" && (
              <div>
                <FieldLabel>Current status</FieldLabel>
                <Select
                  value={form.currentStatus || ""}
                  aria-invalid={invalid("currentStatus")}
                  onChange={(e) => set({ currentStatus: e.target.value })}
                >
                  <option value="">Not set</option>
                  {CURRENT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
                <FieldError>{errors.currentStatus}</FieldError>
              </div>
            )}
          </FormRow>
        </section>

        <section className={CARD}>
          <p className={TITLE}>Project information</p>
          <div className="space-y-4">
            {form.projectInformations.map((project, i) => (
              <ProjectInformationBlock
                key={i}
                index={i}
                project={project}
                activities={activities}
                onChange={(p) => updateProject(i, p)}
                onRemove={() => removeProject(i)}
                removable={form.projectInformations.length > 1}
                errors={errors}
              />
            ))}
          </div>
          <FieldError>{errors.projects}</FieldError>
          <button
            type="button"
            onClick={addProject}
            className="mt-4 w-full rounded-lg bg-ink-950 py-2.5 text-sm font-medium text-white hover:bg-signal-600 dark:ring-1 dark:ring-ink-700"
          >
            + Click here to add another project
          </button>
        </section>

        <section className={CARD}>
          <p className={TITLE}>Site visit information</p>
          <SiteVisitFormSection
            siteVisit={form.siteVisit}
            onChange={(siteVisit) => set({ siteVisit })}
            permitFiles={permitFiles}
            onPermitFilesChange={setPermitFiles}
            maxSizeMB={MAX_FILE_MB}
            errors={errors}
          />
        </section>

        <section className={CARD}>
          <p className={TITLE}>Additional attachments &amp; remarks</p>
          <FileUpload
            files={form.attachments}
            onChange={(attachments) => set({ attachments })}
            defaultType="DRAWING"
            typeOptions={ATTACHMENT_TYPES}
            maxSizeMB={MAX_FILE_MB}
          />
          {upload && (
            <p className="mt-2 text-xs text-ink-400">
              Uploading {upload.count} file{upload.count > 1 ? "s" : ""} ·{" "}
              {mb(upload.total)} total
              {MAX_REQUEST_MB ? ` (limit ${MAX_REQUEST_MB} MB)` : ""}
            </p>
          )}
          <FieldError>{errors.attachments}</FieldError>
          <div className="mt-4">
            <FieldLabel>Remarks</FieldLabel>
            <Textarea
              rows={3}
              value={form.remarks || ""}
              aria-invalid={invalid("remarks")}
              onChange={(e) => set({ remarks: e.target.value })}
            />
            <FieldError>{errors.remarks}</FieldError>
          </div>
        </section>

        {submitError && (
          <p className="rounded-lg bg-signal-50 px-4 py-2.5 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
            {submitError}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-ink-100 pt-5 dark:border-ink-800">
          {mode !== "edit" && (
            <Button type="button" variant="secondary" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving
              ? "Saving…"
              : mode === "edit"
                ? "Save changes"
                : "Submit enquiry"}
          </Button>
        </div>
      </form>
    </div>
  );
}
