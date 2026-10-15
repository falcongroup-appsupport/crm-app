import { useRef, useState } from "react";
import { Eye, EyeOff, FilePlus2, FileUp, LayoutTemplate, Loader2 } from "lucide-react";
import { FieldError } from "../../../../shared/components/forms";
import { RichTextEditor } from "../../../../shared/components/forms/RichTextEditor";
import { useToast } from "../../../../shared/components/feedback/toast/useToast";
import { cn } from "../../../../shared/utils/cn";
import { useQuotationTemplates } from "../../../masters/quotation-templates/hooks/useQuotationTemplates";
import {
  isWordTemplate,
  quotationTemplateApi,
  templateFileExt,
  templateFileName,
} from "../../../masters/quotation-templates/api/quotationTemplate.api";
import {
  STANDARD_OUTLINE_HTML,
  TEMPLATE_MAX_CHARS,
  TEMPLATE_SECTIONS,
} from "../constants/quotationConstants";
import { importDocx } from "../pdf/importDocx";
import { usePdfPreview } from "../hooks/usePdfPreview";

const BTN =
  "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-ink-700 ring-1 ring-inset ring-ink-200 transition-colors hover:bg-ink-100 disabled:pointer-events-none disabled:opacity-40 dark:text-ink-200 dark:ring-ink-700 dark:hover:bg-ink-800";

/**
 * Template sections of the quotation (scope of services, general considerations,
 * reporting & deliverables, equipment & personnel) in a Word-style editor,
 * with a live PDF preview beside it.
 *  - value / onChange : HTML string (`templateContents`)
 *  - previewQuotation : quotation-shaped object the PDF is rendered from
 */
export function ProposalContentSection({ value, onChange, previewQuotation, error }) {
  const toast = useToast();
  const docxRef = useRef(null);
  const [preview, setPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const { templates } = useQuotationTemplates({ activeOnly: true });
  const { url, busy, error: previewError } = usePdfPreview(previewQuotation, preview);

  // replace after a confirmation when there is already text
  const replaceWith = (html, label) => {
    if (value && !window.confirm(`Replace the current template content with ${label}?`))
      return false;
    onChange(html);
    return true;
  };

  // shared by "Upload Word" and the template picker
  const applyDocx = async (source, name) => {
    setImporting(true);
    try {
      const { html, warnings, found } = await importDocx(source);
      if (!html.trim()) {
        toast.warning("That document has no readable text");
        return;
      }
      if (!replaceWith(html, `“${name}”`)) return;
      const pics = (html.match(/<img/g) ?? []).length;
      toast.success("Template loaded", {
        description: !found
          ? "The four standard headings weren't found, so the whole document was loaded — trim what you don't need."
          : warnings
            ? `${warnings} item${warnings === 1 ? "" : "s"} couldn't be converted exactly — review before saving.`
            : `${pics ? `${pics} picture${pics === 1 ? "" : "s"} included. ` : ""}Edit the sections, then save the quotation.`,
      });
    } catch {
      toast.error("Couldn't read that Word file");
    } finally {
      setImporting(false);
    }
  };

  const onDocx = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/\.docx$/i.test(file.name)) {
      toast.warning("Please choose a Word (.docx) file", {
        description: "Older .doc files need to be saved as .docx first.",
      });
      return;
    }
    applyDocx(file, file.name);
  };

  const onPickTemplate = async (e) => {
    const t = templates.find((x) => String(x.id) === e.target.value);
    e.target.value = "";
    if (!t) return;
    if (!isWordTemplate(t)) {
      toast.warning(
        `“${t.name}” is a ${templateFileExt(t).toUpperCase() || "non-Word"} file`,
        {
          description:
            "Only Word (.docx) templates can be loaded into the editor. Upload the Word version in Masters → Quotation templates.",
        },
      );
      return;
    }
    setImporting(true);
    let blob;
    try {
      blob = await quotationTemplateApi.fetchFile(t);
    } catch (err) {
      setImporting(false);
      toast.error("Couldn't download that template", {
        description: `${err?.message || "The file request failed."} You can use “Upload Word” instead.`,
      });
      return;
    }
    setImporting(false);
    applyDocx(new File([blob], templateFileName(t) || `${t.name}.docx`), t.name);
  };

  const actions = (
    <>
      {importing && <Loader2 className="h-4 w-4 animate-spin text-ink-400" />}
      {templates.length > 0 && (
        <label className={cn(BTN, "relative pr-1.5")}>
          <LayoutTemplate className="h-3.5 w-3.5" />
          <span>Load template</span>
          <select
            aria-label="Load a template"
            value=""
            disabled={importing}
            onChange={onPickTemplate}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            <option value="">Load template…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id} disabled={!isWordTemplate(t)}>
                {t.name}
                {isWordTemplate(t)
                  ? ""
                  : ` (${templateFileExt(t).toUpperCase()} — not loadable)`}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        type="button"
        className={BTN}
        disabled={importing}
        onClick={() => docxRef.current?.click()}
      >
        <FileUp className="h-3.5 w-3.5" />
        Upload Word
      </button>
      <button
        type="button"
        className={BTN}
        onClick={() =>
          replaceWith(STANDARD_OUTLINE_HTML, "the blank four-section outline")
        }
      >
        <FilePlus2 className="h-3.5 w-3.5" />
        Blank sections
      </button>
      <button
        type="button"
        aria-pressed={preview}
        onClick={() => setPreview((p) => !p)}
        className={cn(
          BTN,
          preview &&
            "bg-signal-50 text-signal-700 ring-signal-300 dark:bg-signal-500/15 dark:text-signal-300",
        )}
      >
        {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {preview ? "Hide preview" : "PDF preview"}
      </button>
      <input
        ref={docxRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={onDocx}
      />
    </>
  );

  return (
    <div
      className={preview ? "grid gap-4 2xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" : ""}
    >
      <div className="min-w-0">
        <RichTextEditor
          value={value}
          onChange={onChange}
          actions={actions}
          sections={TEMPLATE_SECTIONS}
          maxChars={TEMPLATE_MAX_CHARS}
          onError={(msg) => toast.error(msg)}
        />
        <FieldError>{error}</FieldError>
        <p className="mt-2 text-xs text-ink-400">
          Only these four sections come from the template. Customer, subject, time
          schedule, pricing, payment terms and contact details are filled in from the
          quotation.
        </p>
      </div>

      {preview && (
        <div className="relative min-h-[32rem] overflow-hidden rounded-xl bg-ink-100 ring-1 ring-ink-200 2xl:sticky 2xl:top-4 2xl:h-[80vh] dark:bg-ink-900 dark:ring-ink-700">
          {url ? (
            <iframe
              title="Proposal PDF preview"
              src={`${url}#view=FitH`}
              className="h-full min-h-[32rem] w-full"
            />
          ) : (
            <div className="flex h-full min-h-[32rem] items-center justify-center text-sm text-ink-400">
              {previewError ?? "Preparing preview…"}
            </div>
          )}
          {busy && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs text-ink-600 shadow dark:bg-ink-800/90 dark:text-ink-300">
              <Loader2 className="h-3 w-3 animate-spin" />
              Updating…
            </span>
          )}
        </div>
      )}
    </div>
  );
}
