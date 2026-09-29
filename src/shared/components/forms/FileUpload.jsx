import { useRef } from "react";
import { Paperclip, X, FileText } from "lucide-react";

export function FileUpload({ files, onChange, label = "Attachments" }) {
  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    const additions = Array.from(fileList).map((file) => ({ file, fileType: "OTHER" }));
    onChange([...files, ...additions]);
  };

  const removeAt = (index) => onChange(files.filter((_, i) => i !== index));

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink-700 dark:text-ink-300">{label}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-200 bg-ink-50 px-4 py-4 text-sm text-ink-500 transition-colors hover:border-signal-300 hover:text-signal-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-400"
      >
        <Paperclip className="h-4 w-4" />
        Click to attach files
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
      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-ink-50 px-3 py-2 text-sm dark:bg-ink-800">
              <span className="flex min-w-0 items-center gap-2 text-ink-700 dark:text-ink-300">
                <FileText className="h-4 w-4 shrink-0 text-ink-400" />
                <span className="truncate">{f.file?.name ?? f.fileName}</span>
              </span>
              <button type="button" onClick={() => removeAt(i)} className="shrink-0 text-ink-400 hover:text-signal-600">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
