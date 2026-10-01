import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Modal } from "../../../../shared/components/ui/Modal";
import { Button } from "../../../../shared/components/ui/Button";
import { FieldLabel, Input } from "../../../../shared/components/forms";
import { ApiError } from "../../../../shared/api/axiosInstance";

/** Create (template = null) or edit a quotation template. On edit the file is optional. */
export function TemplateFormModal({ open, onClose, template, onSubmit }) {
  const isEdit = Boolean(template);
  const [name, setName] = useState(template?.name ?? "");
  const [file, setFile] = useState(null);
  const [wasOpen, setWasOpen] = useState(open);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(template?.name ?? "");
      setFile(null);
      setError(null);
    }
  }

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), file });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the template.");
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
          <p className="text-xs text-signal-600 dark:text-signal-400">{error}</p>
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
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Standard Quotation Template" />
        </div>
        <div>
          <FieldLabel required={!isEdit}>File (PDF, DOCX…)</FieldLabel>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-200 bg-ink-50 px-4 py-4 text-sm text-ink-500 transition-colors hover:border-signal-300 hover:text-signal-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-400"
          >
            {file ? <FileText className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
            {file ? file.name : isEdit ? "Replace file (optional)" : "Choose a file"}
          </button>
          <input ref={inputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {isEdit && !file && (template?.fileName || template?.originalFileName) && (
            <p className="mt-1.5 text-xs text-ink-400">Current file: {template.fileName ?? template.originalFileName}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
