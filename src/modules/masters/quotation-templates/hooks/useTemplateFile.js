import { useCallback, useState } from "react";
import DOMPurify from "dompurify";
import {
  quotationTemplateApi,
  templateFileExt,
  templateFileName,
} from "../api/quotationTemplate.api";

const IMAGE = ["png", "jpg", "jpeg", "gif", "webp"];

/** Word file → sanitised HTML for the in-app viewer (mammoth is loaded on demand). */
async function docxToHtml(blob) {
  const mod = await import("mammoth");
  const mammoth = mod.default ?? mod;
  const { value } = await mammoth.convertToHtml({
    arrayBuffer: await blob.arrayBuffer(),
  });
  return DOMPurify.sanitize(value, { ALLOWED_URI_REGEXP: /^(?:https?:|data:image\/)/i });
}

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/**
 * View / download a quotation template's file.
 * preview = { template, name, ext, kind: "pdf" | "image" | "docx" | "other", url?, html? }
 */
export function useTemplateFile({ onError } = {}) {
  const [busyId, setBusyId] = useState(null);
  const [preview, setPreview] = useState(null);

  const download = useCallback(
    async (t) => {
      setBusyId(t.id);
      try {
        saveBlob(await quotationTemplateApi.fetchFile(t), templateFileName(t) || t.name);
      } catch (err) {
        onError?.(t, err);
      } finally {
        setBusyId(null);
      }
    },
    [onError],
  );

  const view = useCallback(
    async (t) => {
      setBusyId(t.id);
      try {
        const blob = await quotationTemplateApi.fetchFile(t);
        const ext = templateFileExt(t);
        const name = templateFileName(t) || t.name;
        const base = { template: t, name, ext, blob };
        if (ext === "pdf")
          setPreview({
            ...base,
            kind: "pdf",
            // the server may send a generic type — force PDF so the browser viewer opens it
            url: URL.createObjectURL(new Blob([blob], { type: "application/pdf" })),
          });
        else if (IMAGE.includes(ext))
          setPreview({ ...base, kind: "image", url: URL.createObjectURL(blob) });
        else if (ext === "docx")
          setPreview({ ...base, kind: "docx", html: await docxToHtml(blob) });
        else setPreview({ ...base, kind: "other" });
      } catch (err) {
        onError?.(t, err);
      } finally {
        setBusyId(null);
      }
    },
    [onError],
  );

  const close = useCallback(() => {
    setPreview((p) => {
      if (p?.url) URL.revokeObjectURL(p.url);
      return null;
    });
  }, []);

  const save = useCallback(
    () => preview && saveBlob(preview.blob, preview.name),
    [preview],
  );

  return { busyId, preview, view, download, close, save };
}
