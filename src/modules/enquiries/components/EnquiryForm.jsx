import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeftRight,
  Building2,
  ChevronLeft,
  Info,
  Lock,
  Save,
  RotateCcw,
  UserPlus,
  Users,
} from "lucide-react";
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
import { useToast } from "../../../shared/components/feedback/toast/useToast";
import { ProjectInformationBlock } from "./ProjectInformationBlock";
import { SiteVisitFormSection } from "./SiteVisitFormSection";
import { AttachmentList } from "./AttachmentList";
import { ExistingEnquiryPicker } from "./ExistingEnquiryPicker";
import { useActivities } from "../../masters/activities/hooks/useActivities";
import { useEnquiries } from "../hooks/useEnquiries";
import { useEnquiry } from "../hooks/useEnquiry";
import { useExistingEnquirySearch } from "../hooks/useExistingEnquirySearch";
import { ApiError } from "../../../shared/api/axiosInstance";
import {
  diffEnquiry,
  emptyEnquiry,
  emptyProject,
  fillScopeIds,
  formFromExistingCustomer,
  normalizeEnquiry,
  validateEnquiry,
} from "../schemas/enquiry.schema";
import { attachmentApi } from "../api/attachment.api";
import {
  buildEnquiryFormData,
  buildEnquiryUpdateFormData,
  countParts,
  enquiryApi,
} from "../api/enquiry.api";
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

function explain413({ fields, files }, upload) {
  const sent = `${fields} form field${fields === 1 ? "" : "s"}${files ? ` and ${files} file${files === 1 ? "" : "s"} (${mb(upload.total)})` : " and no files"}`;
  if (!upload || upload.total < 1024 * 1024) {
    return (
      `The server rejected the request (HTTP 413), but it only contained ${sent}. That isn't a size problem — the backend ` +
      "limits how many form fields one multipart request may have (Tomcat maxPartCount). Ask the backend to raise " +
      "server.tomcat.max-part-count (e.g. to 200)."
    );
  }
  return (
    `The server rejected the request as too large (HTTP 413): ${sent}, largest "${upload.largest.name}" at ${mb(upload.largest.size)}. ` +
    "Raise spring.servlet.multipart.max-file-size / max-request-size (and server.tomcat.max-part-count, and nginx client_max_body_size if used), or attach smaller files."
  );
}

function describeUpload(files) {
  const real = files.map((f) => f.file).filter(Boolean);
  if (!real.length) return null;
  const total = real.reduce((s, f) => s + f.size, 0);
  const largest = real.reduce((a, b) => (b.size > a.size ? b : a));
  return { count: real.length, total, largest };
}

function CustomerModeSwitch({ value, onChange }) {
  const options = [
    { value: "new", label: "New customer", icon: UserPlus },
    { value: "existing", label: "Existing customer", icon: Users },
  ];
  return (
    <div
      role="tablist"
      aria-label="Customer"
      className="inline-flex rounded-xl bg-ink-100 p-1 dark:bg-ink-800"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            value === o.value
              ? "bg-white text-ink-950 shadow-sm dark:bg-ink-950 dark:text-white"
              : "text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white"
          }`}
        >
          <o.icon className="h-4 w-4" />
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Add / edit enquiry.
 * Create has two starts: "New customer" (blank form) and "Existing customer"
 * (search a previous enquiry, copy only its customer details — company locked —
 * and fill everything else fresh; saved with enquiryType EXISTING +
 * selectedEnquiryId).
 */
export function EnquiryForm({ mode, id }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { activities } = useActivities();
  const { enquiries, createEnquiry, updateEnquiry, connected, refresh } =
    useEnquiries();
  const {
    enquiry,
    loading,
    error: loadError,
  } = useEnquiry(id, { enabled: mode === "edit" });

  const [form, setForm] = useState(emptyEnquiry);
  const [permitFiles, setPermitFiles] = useState([]);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);

  // create only: new customer, or a previous enquiry's customer
  const [customerMode, setCustomerMode] = useState("new");
  const [source, setSource] = useState(null); // { id, enquiryNo, companyName } of the picked enquiry
  const [pickerSeed, setPickerSeed] = useState({});
  const [selectingId, setSelectingId] = useState(null);
  const previous = useExistingEnquirySearch({ delay: 600 });

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

  const resetForm = (next = emptyEnquiry()) => {
    setForm(next);
    setPermitFiles([]);
    setAttempted(false);
  };

  const handleReset = () => {
    if (mode === "edit") return; // reset only makes sense for a fresh registration
    resetForm(
      source
        ? {
            ...emptyEnquiry(),
            companyName: form.companyName,
            contactPerson: form.contactPerson,
            contactNumber: form.contactNumber,
            customerEmail: form.customerEmail,
          }
        : emptyEnquiry(),
    );
  };

  // ---- existing customer ----------------------------------------------------

  const showExisting = () => {
    setPickerSeed({
      companyName: form.companyName,
      contactPerson: form.contactPerson,
    });
    setSource(null);
    setCustomerMode("existing");
  };

  const showNew = (names = {}) => {
    setSource(null);
    setCustomerMode("new");
    setForm((f) => ({
      ...f,
      companyName: f.companyName || names.companyName || "",
      contactPerson: f.contactPerson || names.contactPerson || "",
    }));
  };

  const pickCustomer = async (row) => {
    setSelectingId(row.id);
    try {
      const record = await enquiryApi.getById(row.id); // list rows don't carry email / contact number
      resetForm(formFromExistingCustomer(record));
      setSource({
        id: record.id,
        enquiryNo: record.enquiryNo,
        companyName: record.companyName,
      });
    } catch (err) {
      toast.error("Couldn't load that customer", {
        description:
          err instanceof ApiError ? err.message : "Please try again.",
      });
    } finally {
      setSelectingId(null);
    }
  };

  // Typing a company / contact on a new-customer enquiry looks for previous enquiries.
  const onCustomerChange = (patch) => {
    set(patch);
    if (mode === "create" && customerMode === "new") {
      previous.search({
        companyName: form.companyName,
        contactPerson: form.contactPerson,
        ...patch,
      });
    }
  };
  const previousMatches =
    mode === "create" && customerMode === "new" && previous.status === "done"
      ? previous.results
      : [];

  // ---- submit ---------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);

    const found = validateEnquiry(form, {
      mode,
      files: allFiles,
      maxFileMB: MAX_FILE_MB,
      maxRequestMB: MAX_REQUEST_MB,
    });
    if (Object.keys(found).length) {
      const count = Object.keys(found).length;
      toast.warning(
        count === 1
          ? "1 field needs attention"
          : `${count} fields need attention`,
        { description: "They're highlighted in red on the form." },
      );
      // wait for the red rings to render, then bring the first one into view
      setTimeout(() => {
        const first = document.querySelector('[aria-invalid="true"]');
        first?.scrollIntoView({ behavior: "smooth", block: "center" });
        first?.focus({ preventScroll: true });
      }, 0);
      return;
    }

    // Edit sends only what changed — nested rows with their id (see diffEnquiry).
    // Create sends the full form; for an existing customer it's tagged EXISTING.
    let changes = {};
    if (mode === "edit") {
      const listRow = enquiries.find((e) => String(e.id) === String(id));
      const original = normalizeEnquiry(fillScopeIds(enquiry, listRow));
      const diff = diffEnquiry(original, fillScopeIds(form, listRow));
      if (diff.unidentified.length) {
        toast.error("Some activity rows can't be updated", {
          description:
            `The server didn't return ids for: ${diff.unidentified.join(", ")}. ` +
            "GET /api/enquiry/{id} returns scopeOfServices[].id as null — once the backend returns them, editing will work.",
        });
        return;
      }
      changes = diff.changes;
    }
    const payload =
      mode === "edit"
        ? { ...changes, attachments: allFiles }
        : {
            ...form,
            attachments: allFiles,
            ...(source
              ? {
                  enquiryType: "EXISTING",
                  selectedEnquiryId: source.id,
                  companyName: source.companyName,
                }
              : { enquiryType: "NEW" }),
          };
    const hasUpdate =
      mode === "edit" &&
      (Object.keys(changes).length > 0 || allFiles.length > 0);

    if (mode === "edit" && !hasUpdate && removedAttachmentIds.length === 0) {
      toast.info("No changes to save");
      navigate(`/enquiries/${id}`);
      return;
    }

    setSaving(true);
    try {
      if (mode === "edit") {
        if (hasUpdate) await updateEnquiry(id, payload);
        for (const attachmentId of removedAttachmentIds) {
          try {
            await attachmentApi.remove(attachmentId);
          } catch (err) {
            const name =
              form.existingAttachments.find((a) => a.id === attachmentId)
                ?.fileName ?? `#${attachmentId}`;
            throw new ApiError(
              `${hasUpdate ? "Changes were saved, but " : ""}"${name}" couldn't be removed: ${err?.message || "request failed"}`,
              err?.status ?? 0,
            );
          }
        }
        const removed = removedAttachmentIds.length;
        toast.success("Enquiry updated", {
          description: [
            form.enquiryNo,
            removed ? `${removed} file${removed > 1 ? "s" : ""} removed` : null,
          ]
            .filter(Boolean)
            .join(" · "),
        });
        navigate(`/enquiries/${id}`);
      } else {
        const created = await createEnquiry(payload);
        toast.success(
          source ? "Enquiry added for existing customer" : "Enquiry registered",
          {
            description: created?.enquiryNo ?? form.companyName,
          },
        );
        navigate(created?.id ? `/enquiries/${created.id}` : "/enquiries");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 413) {
        const parts = countParts(
          mode === "edit"
            ? buildEnquiryUpdateFormData(payload)
            : buildEnquiryFormData(payload),
        );
        toast.error("Upload rejected by the server", {
          description: explain413(parts, upload),
          duration: 0,
        });
      } else {
        toast.error(
          mode === "edit"
            ? "Couldn't save changes"
            : "Couldn't register the enquiry",
          {
            description:
              err instanceof ApiError ? err.message : "Please try again.",
          },
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleRemoveAttachment = (attachmentId) =>
    setRemovedAttachmentIds((ids) =>
      ids.includes(attachmentId)
        ? ids.filter((x) => x !== attachmentId)
        : [...ids, attachmentId],
    );

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
  const companyLocked = mode === "create" && Boolean(source);
  const showPicker =
    mode === "create" && customerMode === "existing" && !source;

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
          <p
            className={`text-sm text-ink-400 ${mode === "edit" ? "font-mono" : ""}`}
          >
            {mode === "edit"
              ? form.enquiryNo
              : customerMode === "existing"
                ? "New enquiry for a customer you've worked with before"
                : "Enquiry number will be generated automatically on save"}
          </p>
        </div>
      </div>

      {mode === "create" && (
        <CustomerModeSwitch
          value={customerMode}
          onChange={(v) => (v === "existing" ? showExisting() : showNew())}
        />
      )}

      {showPicker ? (
        <div className="space-y-4">
          <ExistingEnquiryPicker
            key={`${pickerSeed.companyName}|${pickerSeed.contactPerson}`}
            initialCompany={pickerSeed.companyName ?? ""}
            initialContact={pickerSeed.contactPerson ?? ""}
            onSelect={pickCustomer}
            onCreateNew={showNew}
            selecting={selectingId}
          />
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <section className={CARD}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                  Customer / Client details
                </p>
                {companyLocked && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-400">
                      Copied from{" "}
                      <span className="font-mono font-medium text-ink-600 dark:text-ink-300">
                        {source.enquiryNo}
                      </span>
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={showExisting}
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      Change customer
                    </Button>
                  </div>
                )}
              </div>
              <FormRow>
                <div>
                  <FieldLabel required>Company name</FieldLabel>
                  {companyLocked ? (
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <Input
                        value={form.companyName}
                        readOnly
                        disabled
                        className="pl-9 pr-9"
                        title="Company comes from the existing customer"
                      />
                      <Lock className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
                    </div>
                  ) : (
                    <Input
                      value={form.companyName}
                      aria-invalid={invalid("companyName")}
                      onChange={(e) =>
                        onCustomerChange({ companyName: e.target.value })
                      }
                      placeholder="Falcon Group"
                    />
                  )}
                  <FieldError>{errors.companyName}</FieldError>
                </div>
                <div>
                  <FieldLabel required>Contact person</FieldLabel>
                  <Input
                    value={form.contactPerson}
                    aria-invalid={invalid("contactPerson")}
                    onChange={(e) =>
                      onCustomerChange({ contactPerson: e.target.value })
                    }
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
                  <FieldLabel>Email</FieldLabel>
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
              {previousMatches.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                  <span className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      This company / contact has{" "}
                      {previousMatches.length === 1
                        ? "a previous enquiry"
                        : `${previousMatches.length} previous enquiries`}{" "}
                      (
                      {previousMatches
                        .slice(0, 3)
                        .map((m) => m.enquiryNo)
                        .join(", ")}
                      {previousMatches.length > 3 ? "…" : ""}). Use their saved
                      customer details?
                    </span>
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={showExisting}
                  >
                    <Users className="h-4 w-4" />
                    Use existing customer
                  </Button>
                </div>
              )}
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
                    onChange={(e) =>
                      set({ submissionDeadline: e.target.value })
                    }
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
                    removable={
                      form.projectInformations.length > 1 &&
                      !(mode === "edit" && project._saved)
                    }
                    lockSaved={mode === "edit"}
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
              {mode === "edit" && (
                <div className="mb-5">
                  <p className="mb-1 text-sm font-medium text-ink-700 dark:text-ink-300">
                    Saved files
                  </p>
                  <AttachmentList
                    attachments={form.existingAttachments ?? []}
                    removedIds={removedAttachmentIds}
                    onToggleRemove={toggleRemoveAttachment}
                    emptyText="No files uploaded yet."
                  />
                </div>
              )}
              <FileUpload
                label={mode === "edit" ? "Add files" : "Attachments"}
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
        </>
      )}
    </div>
  );
}
