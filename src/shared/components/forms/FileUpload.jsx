import { useRef, useState } from "react";
import { Paperclip, X, FileText } from "lucide-react";
import { Select } from "./Select";

function formatSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * File picker. `typeOptions` shows a per-file type dropdown (sent as the
 * `fileTypes` value); without it every file gets `defaultType`.
 * `maxSizeMB` (0 = no client-side limit) rejects oversized files up front
 * instead of waiting for the server to answer 413.
 */
export function FileUpload({ files, onChange, label = "Attachments", defaultType = "OTHER", typeOptions, maxSizeMB = 0 }) {
  const inputRef = useRef(null);
  const [error, setError] = useState(null);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList);
    const limit = maxSizeMB * 1024 * 1024;
    const accepted = limit ? incoming.filter((f) => f.size <= limit) : incoming;
    const rejected = incoming.filter((f) => !accepted.includes(f));
    setError(
      rejected.length
        ? `${rejected.map((f) => f.name).join(", ")} ${rejected.length > 1 ? "are" : "is"} over the ${maxSizeMB} MB limit and wasn't added.`
        : null,
    );
    onChange([...files, ...accepted.map((file) => ({ file, fileType: defaultType }))]);
  };

  const removeAt = (index) => onChange(files.filter((_, i) => i !== index));
  const setType = (index, fileType) => onChange(files.map((f, i) => (i === index ? { ...f, fileType } : f)));

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink-700 dark:text-ink-300">{label}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-200 bg-ink-50 px-4 py-4 text-sm text-ink-500 transition-colors hover:border-signal-300 hover:text-signal-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-400"
      >
        <Paperclip className="h-4 w-4" />
        Click to attach files{maxSizeMB ? ` (max ${maxSizeMB} MB each)` : ""}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-2 text-xs text-signal-600 dark:text-signal-400">{error}</p>}
      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between gap-3 rounded-lg bg-ink-50 px-3 py-2 text-sm dark:bg-ink-800">
              <span className="flex min-w-0 items-center gap-2 text-ink-700 dark:text-ink-300">
                <FileText className="h-4 w-4 shrink-0 text-ink-400" />
                <span className="truncate">{f.file?.name ?? f.fileName}</span>
                {f.file && <span className="shrink-0 text-xs text-ink-400">{formatSize(f.file.size)}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {typeOptions && (
                  <Select value={f.fileType} onChange={(e) => setType(i, e.target.value)} className="!py-1 !text-xs">
                    {typeOptions.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                )}
                <button type="button" onClick={() => removeAt(i)} className="text-ink-400 hover:text-signal-600" aria-label="Remove file">
                  <X className="h-4 w-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
