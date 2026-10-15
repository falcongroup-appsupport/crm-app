import { makeHtmlPdfSafe } from "../../../../shared/utils/imageTools";

/**
 * Renders the quotation PDF. @react-pdf/renderer is loaded on demand so it
 * stays out of the main bundle. Images the PDF engine can't draw (GIF, WebP…)
 * are converted first, so older saved content still prints its pictures.
 */
export async function renderQuotationPdf(quotation) {
  const [{ pdf }, { createElement }, { QuotationPdf }, templateContents] =
    await Promise.all([
      import("@react-pdf/renderer"),
      import("react"),
      import("./QuotationPdf"),
      makeHtmlPdfSafe(quotation?.templateContents),
    ]);
  return pdf(
    createElement(QuotationPdf, { quotation: { ...quotation, templateContents } }),
  ).toBlob();
}

export async function downloadQuotationPdf(quotation) {
  const blob = await renderQuotationPdf(quotation);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${quotation.quotationNo || `quotation-${quotation.id}`}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
