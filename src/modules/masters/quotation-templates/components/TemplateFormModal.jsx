import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Modal } from "../../../../shared/components/ui/Modal";
import { Button } from "../../../../shared/components/ui/Button";
import { FieldLabel, Input } from "../../../../shared/components/forms";
import { ApiError } from "../../../../shared/api/axiosInstance";
import { useToast } from "../../../../shared/components/feedback/toast/useToast";
import { templateFileName } from "../api/quotationTemplate.api";

/** Create (template = null) or edit a quotation template. On edit the file is optional. */
export function TemplateFormModal({ open, onClose, template, onSubmit }) {
  const isEdit = Boolean(template);
  const [name, setName] = useState(template?.name ?? "");
  const [file, setFile] = useState(null);
  const [wasOpen, setWasOpen] = useState(open);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const inputRef = useRef(null);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(template?.name ?? "");
      setFile(null);
    }
  }

  const submit = async () => {
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), file });
      toast.success(isEdit ? "Template updated" : "Template uploaded", {
        description: name.trim(),
      });
      onClose();
    } catch (err) {
      toast.error("Couldn't save the template", {
        description: err instanceof ApiError ? err.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const canSave = name.trim() && (isEdit || file);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit template" : "New quotation template"}
      width="max-w-md"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span />
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit} disabled={saving || !canSave}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <FieldLabel required>Name</FieldLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Standard Quotation Template"
          />
        </div>
        <div>
          <FieldLabel required={!isEdit}>Word file (.docx)</FieldLabel>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-200 bg-ink-50 px-4 py-4 text-sm text-ink-500 transition-colors hover:border-signal-300 hover:text-signal-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-400"
          >
            {file ? <FileText className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
            {file ? file.name : isEdit ? "Replace file (optional)" : "Choose a file"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
          {file && !/\.docx$/i.test(file.name) ? (
            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
              Only Word (.docx) templates can be loaded into a quotation. This file will
              be kept for reference only.
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-ink-400">
              {isEdit && !file && template?.filePath
                ? `Current file: ${templateFileName(template)}`
                : "Use the Word version of the quotation — its four template sections are loaded into the editor."}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
