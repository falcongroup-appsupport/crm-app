/**
 * Turns the saved template text (HTML from the editor) into simple blocks the PDF can draw:
 *
 *   { type: "heading",    text }                         h1–h3 → red section heading
 *   { type: "subheading", text }                         h4–h6 → grey sub-heading band
 *   { type: "paragraph",  runs, text, align }
 *   { type: "bullet",     runs, text, level, marker }    marker = "1." for numbered lists
 *   { type: "images",     items: [{ src, width }], align } images sitting in one row
 *   { type: "table",      rows: [[{ runs, text, header }]] }
 *
 * `runs` are inline pieces: { text, b, i, u }. `width` is a percentage of the page text width.
 */
export function parseContent(content) {
  if (!content) return [];
  if (Array.isArray(content)) {
    return content.flatMap((s) => [
      { type: "heading", text: s.title ?? "" },
      ...(s.items ?? []).map((text) => bullet([{ text }], 0, null)),
    ]);
  }
  if (typeof content !== "string" || typeof DOMParser === "undefined") return [];

  const doc = new DOMParser().parseFromString(content, "text/html");
  const blocks = [];
  walk(doc.body, blocks);
  return blocks;
}

const plain = (runs) => runs.map((r) => r.text).join("");
const bullet = (runs, level, marker) => ({
  type: "bullet",
  runs,
  text: plain(runs),
  level,
  marker,
});

const alignOf = (el) => {
  const a = (el.style?.textAlign || el.getAttribute?.("align") || "").toLowerCase();
  return a === "center" || a === "right" || a === "justify" ? a : "left";
};

/** Inline content of an element as styled runs (nested lists and images are skipped). */
function runsOf(el, style = {}) {
  const out = [];
  for (const node of el.childNodes) {
    if (node.nodeType === 3) {
      const text = (node.textContent ?? "").replace(/\s+/g, " ");
      if (text) out.push({ text, ...style });
    } else if (node.nodeType === 1) {
      const tag = node.tagName.toLowerCase();
      if (tag === "ul" || tag === "ol" || tag === "img" || tag === "table") continue;
      if (tag === "br") {
        out.push({ text: "\n", ...style });
        continue;
      }
      const next = { ...style };
      if (tag === "strong" || tag === "b") next.b = true;
      if (tag === "em" || tag === "i") next.i = true;
      if (tag === "u") next.u = true;
      out.push(...runsOf(node, next));
    }
  }
  return trimRuns(mergeRuns(out));
}

function mergeRuns(runs) {
  const out = [];
  for (const r of runs) {
    const last = out[out.length - 1];
    if (last && !!last.b === !!r.b && !!last.i === !!r.i && !!last.u === !!r.u)
      last.text += r.text;
    else out.push({ ...r });
  }
  return out;
}

function trimRuns(runs) {
  if (!runs.length) return runs;
  runs[0].text = runs[0].text.replace(/^\s+/, "");
  const last = runs[runs.length - 1];
  last.text = last.text.replace(/\s+$/, "");
  return runs.filter((r) => r.text !== "");
}

function listBlocks(list, level, blocks) {
  const ordered = list.tagName.toLowerCase() === "ol";
  let n = 0;
  for (const li of list.children) {
    if (li.tagName.toLowerCase() !== "li") continue;
    n += 1;
    const runs = runsOf(li);
    if (runs.length) blocks.push(bullet(runs, level, ordered ? `${n}.` : null));
    const pics = imagesBlock(li, "center", true);
    if (pics) blocks.push(pics);
    for (const nested of li.children) {
      const t = nested.tagName.toLowerCase();
      if (t === "ul" || t === "ol") listBlocks(nested, level + 1, blocks);
    }
  }
}

function tableBlock(table) {
  const rows = [];
  for (const tr of table.querySelectorAll("tr")) {
    const cells = [];
    for (const cell of tr.children) {
      const tag = cell.tagName.toLowerCase();
      if (tag !== "td" && tag !== "th") continue;
      // a cell may hold several paragraphs — join them with line breaks
      const parts = [...cell.querySelectorAll(":scope > p")];
      const runs = parts.length
        ? parts.flatMap((p, i) => [...(i ? [{ text: "\n" }] : []), ...runsOf(p)])
        : runsOf(cell);
      cells.push({ runs, text: plain(runs), header: tag === "th" });
    }
    if (cells.length) rows.push(cells);
  }
  return rows.length ? { type: "table", rows } : null;
}

/** Images in an element → one "row" block (they sit side by side, like in Word). */
function imagesBlock(el, align, ownOnly = false) {
  let imgs = el.tagName === "IMG" ? [el] : [...el.querySelectorAll("img")];
  // for a list item, skip pictures that belong to nested lists (handled there)
  if (ownOnly) imgs = imgs.filter((img) => img.closest("li") === el);
  const items = imgs
    .filter((img) => img.getAttribute("src"))
    .map((img) => {
      const w = Number(img.getAttribute("data-width"));
      return { src: img.getAttribute("src"), width: w > 0 && w <= 100 ? w : null };
    });
  return items.length ? { type: "images", items, align } : null;
}

function walk(node, blocks) {
  for (const el of node.children) {
    const tag = el.tagName.toLowerCase();
    if (/^h[1-3]$/.test(tag)) {
      const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      if (text) blocks.push({ type: "heading", text });
      const pics = imagesBlock(el, "center");
      if (pics) blocks.push(pics);
    } else if (/^h[4-6]$/.test(tag)) {
      const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      if (text) blocks.push({ type: "subheading", text });
      const pics = imagesBlock(el, "center");
      if (pics) blocks.push(pics);
    } else if (tag === "ul" || tag === "ol") {
      listBlocks(el, 0, blocks);
    } else if (tag === "table") {
      const t = tableBlock(el);
      // a table holding only pictures (Word layout) draws as a picture row
      if (t && t.rows.some((r) => r.some((c) => c.text.trim()))) blocks.push(t);
      const pics = imagesBlock(el, "center");
      if (pics) blocks.push(pics);
    } else if (tag === "img") {
      const b = imagesBlock(el, "center");
      if (b) blocks.push(b);
    } else if (tag === "p") {
      const align = alignOf(el);
      const imgs = imagesBlock(el, align);
      if (imgs) blocks.push(imgs);
      const runs = runsOf(el);
      if (runs.length) blocks.push({ type: "paragraph", runs, text: plain(runs), align });
    } else if (
      tag === "div" ||
      tag === "section" ||
      tag === "figure" ||
      tag === "blockquote"
    ) {
      walk(el, blocks);
    }
  }
}

const NUMBERING = /^\s*\d+(\.\d+)*\.?\s+/;
export const stripNumbering = (t) => String(t ?? "").replace(NUMBERING, "");

/** Splits blocks into [{ title, blocks }] at each heading. Leading blocks get `lead`. */
export function toSections(blocks, lead = "Scope of Services") {
  const out = [];
  let cur = null;
  for (const b of blocks) {
    if (b.type === "heading") {
      cur = { title: b.text, blocks: [] };
      out.push(cur);
    } else {
      if (!cur) {
        cur = { title: lead, blocks: [] };
        out.push(cur);
      }
      cur.blocks.push(b);
    }
  }
  return out;
}
