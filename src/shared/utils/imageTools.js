/** Browser-side image helpers for the template editor and PDF (keep saved HTML small and PDF-safe). */

export const MAX_IMAGE_PX = 1100;

/** The PDF engine can only draw JPEG and PNG. */
const PDF_SAFE = /^data:image\/(jpeg|jpg|png);/i;

/** Loads an image from a URL / data URL. */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = src;
  });
}

/**
 * Draws (a region of) an image to a JPEG data URL no wider/taller than `maxPx`.
 * `crop` = { x, y, width, height } in the image's natural pixels.
 */
export function drawToDataUrl(img, crop, maxPx = MAX_IMAGE_PX, quality = 0.85) {
  const c = crop ?? { x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight };
  const scale = Math.min(1, maxPx / Math.max(c.width, c.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(c.width * scale));
  canvas.height = Math.max(1, Math.round(c.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; // flatten transparency (the page is white)
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, c.x, c.y, c.width, c.height, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Makes a data-URL image safe for the PDF and small enough to save:
 *  - GIF / WebP / BMP / SVG / TIFF… → JPEG (the PDF can't draw them)
 *  - big JPEG / PNG → downscaled JPEG
 *  - small JPEG / PNG → unchanged
 * Anything that can't be decoded is returned as is.
 */
export async function normalizeImage(dataUrl, { minBytes = 150_000 } = {}) {
  if (!dataUrl?.startsWith("data:image/")) return dataUrl;
  const safe = PDF_SAFE.test(dataUrl);
  if (safe && dataUrl.length < minBytes) return dataUrl;
  try {
    const img = await loadImage(dataUrl);
    if (
      safe &&
      Math.max(img.naturalWidth, img.naturalHeight) <= MAX_IMAGE_PX &&
      dataUrl.length < 400_000
    )
      return dataUrl;
    return drawToDataUrl(img, null);
  } catch {
    return dataUrl;
  }
}

/** Back-compat alias. */
export const shrinkDataUrl = normalizeImage;

/** Converts every non-JPEG/PNG data image inside an HTML string (used right before PDF render). */
export async function makeHtmlPdfSafe(html) {
  if (!html || typeof html !== "string") return html;
  const re = /src="(data:image\/(?!jpeg|jpg|png)[a-z0-9.+-]+;base64,[^"]+)"/gi;
  const found = [...new Set([...html.matchAll(re)].map((m) => m[1]))];
  if (!found.length) return html;
  let out = html;
  for (const src of found) {
    const fixed = await normalizeImage(src, { minBytes: 0 });
    out = out.split(src).join(fixed);
  }
  return out;
}
