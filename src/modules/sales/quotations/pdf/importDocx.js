import { normalizeImage } from "../../../../shared/utils/imageTools";

/**
 * Word (.docx) quotation → editor HTML holding only the *template* part:
 * scope of services, general considerations, reporting & deliverables, equipment &
 * personnel. The customer block, time schedule, financial table, payment terms,
 * T&C and contact details in the Word file are skipped — those come from the
 * quotation data.
 *
 * If none of the template headings are found, the whole document is returned.
 */

const START =
  /^(scope of services?|general considerations?|reporting\s*(&|and)\s*deliverables?|equipment\s*(&|and)\s*personnel)\b/i;
const END =
  /^(time schedule|financial|terms of payment|payment schedule|payment terms|terms and conditions|contact details)\b/i;

const norm = (t) => (t ?? "").replace(/\s+/g, " ").trim();

// "SCOPE OF SERVICES-:" → "Scope of Services"
function headingText(t) {
  let x = norm(t).replace(/[\s:–-]+$/, "");
  if (x === x.toUpperCase())
    x = x
      .toLowerCase()
      .replace(/\b([a-z])/g, (m) => m.toUpperCase())
      .replace(/\b(Of|And|The)\b/g, (m) => m.toLowerCase());
  return x;
}

const isBoldOnly = (el) => {
  const kids = [...el.childNodes].filter(
    (n) => norm(n.textContent) !== "" || n.nodeName === "IMG",
  );
  return (
    kids.length > 0 &&
    kids.every((n) => n.nodeType === 1 && /^(strong|b)$/i.test(n.nodeName)) &&
    !el.querySelector("img")
  );
};

export async function importDocx(file, { shrink = true, input } = {}) {
  const mod = await import("mammoth");
  const mammoth = mod.default ?? mod;
  const { value, messages } = await mammoth.convertToHtml(
    input ?? { arrayBuffer: await file.arrayBuffer() },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h3:fresh",
        "p[style-name='Heading 2'] => h3:fresh",
        "p[style-name='Heading 3'] => h4:fresh",
        "p[style-name='Title'] => h3:fresh",
      ],
    },
  );
  const warnings = messages.filter((m) => m.type === "warning").length;
  const doc = new DOMParser().parseFromString(value, "text/html");
  const body = doc.body;

  const make = (tag, html) => {
    const el = doc.createElement(tag);
    if (html != null) el.innerHTML = html;
    return el;
  };

  // pass 1: walk the Word content and keep only the template sections
  const sections = []; // { nodes: [], displaced: [img...] }
  let cur = null;
  let found = false;
  const kept = [];
  for (const el of [...body.children]) {
    const text = norm(el.textContent);
    const tag = el.tagName.toLowerCase();
    const textOnly = /^h[1-6]$/.test(tag) || tag === "p";
    if (textOnly && START.test(text)) {
      found = true;
      cur = {
        title: headingText(text),
        nodes: [],
        displaced: [...el.querySelectorAll("img")],
      };
      sections.push(cur);
      continue;
    }
    if (textOnly && END.test(text)) {
      cur = null;
      continue;
    }
    if (!cur) continue;
    cur.nodes.push(el);
  }
  if (!found) {
    // not a Falcon quotation layout — hand back everything for manual trimming
    for (const el of [...body.children]) kept.push(el.cloneNode(true));
    const html = await finish(kept, shrink);
    return { html, warnings, found: false };
  }

  // pass 2: rebuild clean editor HTML
  for (const sec of sections) {
    kept.push(make("h3", sec.title));
    const trailing = [];
    const nodes = [];
    for (const el of sec.nodes) {
      const tag = el.tagName.toLowerCase();
      const text = norm(el.textContent);
      // Word "layout tables" used only to arrange pictures → one centred picture row
      if (tag === "table" && el.querySelector("img") && text.length <= 120) {
        const p = make("p");
        for (const img of el.querySelectorAll("img")) p.appendChild(img.cloneNode(true));
        nodes.push(centered(p));
        for (const cell of el.querySelectorAll("p")) {
          if (!cell.querySelector("img") && norm(cell.textContent))
            nodes.push(centered(make("p", `<strong>${cell.innerHTML}</strong>`)));
        }
        continue;
      }
      // pictures inside list items → lifted into their own row after the list
      if ((tag === "ul" || tag === "ol") && el.querySelector("img")) {
        const list = el.cloneNode(true);
        const p = make("p");
        for (const img of list.querySelectorAll("img")) p.appendChild(img);
        nodes.push(list, centered(p));
        continue;
      }
      if (tag === "p" && el.querySelector("img")) {
        nodes.push(centered(el.cloneNode(true)));
        continue;
      }
      if (tag === "p" && isBoldOnly(el) && /^\d+\.\s/.test(text)) {
        nodes.push(make("h4", text.replace(/^\d+\.\s*/, "")));
        continue;
      }
      if (tag === "p" && !text) continue;
      nodes.push(el.cloneNode(true));
    }
    // short bold lines at the end of a section are picture captions
    while (nodes.length) {
      const last = nodes[nodes.length - 1];
      if (
        last.tagName === "P" &&
        isBoldOnly(last) &&
        norm(last.textContent).length <= 60
      ) {
        trailing.unshift(nodes.pop());
      } else break;
    }
    kept.push(...nodes);
    if (sec.displaced.length) {
      const p = make("p");
      for (const img of sec.displaced) p.appendChild(img.cloneNode(true));
      kept.push(centered(p));
    }
    for (const cap of trailing) kept.push(centered(cap));
  }
  return { html: await finish(kept, shrink), warnings, found: true };
}

function centered(el) {
  el.setAttribute("style", "text-align: center");
  return el;
}

/**
 * Sizes images (side by side when several share a paragraph), converts them to
 * PDF-safe JPEG/PNG (Word often embeds GIFs), shrinks big ones, serializes.
 */
async function finish(nodes, shrink) {
  const wrap = nodes[0]?.ownerDocument.createElement("div");
  if (!wrap) return "";
  nodes.forEach((n) => wrap.appendChild(n));
  for (const p of wrap.querySelectorAll("p")) {
    const imgs = [...p.querySelectorAll("img")];
    if (!imgs.length) continue;
    if (!p.getAttribute("style")) p.setAttribute("style", "text-align: center");
    for (const img of imgs) {
      const src = img.getAttribute("src") ?? "";
      if (!img.getAttribute("data-width")) {
        const big = src.length > 150_000; // a photo or map, not an icon
        img.setAttribute(
          "data-width",
          String(imgs.length > 1 ? Math.floor(94 / imgs.length) : big ? 100 : 40),
        );
      }
      if (shrink) img.setAttribute("src", await normalizeImage(src));
      if (!img.getAttribute("alt") || img.getAttribute("alt").startsWith("http"))
        img.setAttribute("alt", "");
    }
  }
  return wrap.innerHTML;
}
