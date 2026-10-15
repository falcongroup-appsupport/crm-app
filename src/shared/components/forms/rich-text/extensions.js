import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";

/** Width presets snap when a drag ends within this many % of them. */
const SNAP = [25, 33, 50, 75, 100];
const snap = (pct) => SNAP.find((s) => Math.abs(s - pct) <= 2) ?? pct;

/**
 * Inline picture whose `width` is a % of the text width (the PDF uses the same %).
 * Saved as `data-width` + `style="width:N%"`. In the editor it can be resized by
 * dragging the side handles, like Word.
 */
export const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const w = Number(el.getAttribute("data-width"));
          return w > 0 && w <= 100 ? w : null;
        },
        renderHTML: (attrs) =>
          attrs.width
            ? { "data-width": String(attrs.width), style: `width:${attrs.width}%` }
            : {},
      },
      height: { default: null, renderHTML: () => ({}), parseHTML: () => null },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      let current = node;
      const dom = document.createElement("span");
      dom.className = "rte-img";
      const img = document.createElement("img");
      img.draggable = false;
      const badge = document.createElement("span");
      badge.className = "rte-img-badge";
      dom.append(img, badge);
      const handles = ["l", "r"].map((side) => {
        const h = document.createElement("span");
        h.className = `rte-img-handle rte-img-handle-${side}`;
        h.dataset.side = side;
        h.title = "Drag to resize";
        dom.appendChild(h);
        return h;
      });

      const apply = (n) => {
        if (img.getAttribute("src") !== n.attrs.src) img.src = n.attrs.src ?? "";
        img.alt = n.attrs.alt ?? "";
        dom.style.width = n.attrs.width ? `${n.attrs.width}%` : "";
        badge.textContent = n.attrs.width ? `${n.attrs.width}%` : "Auto";
      };
      apply(node);

      const onDown = (e) => {
        if (!editor.isEditable) return;
        e.preventDefault();
        e.stopPropagation();
        const side = e.currentTarget.dataset.side;
        const full = dom.parentElement?.clientWidth || 1;
        const startX = e.clientX;
        const startW = dom.getBoundingClientRect().width;
        let pct = current.attrs.width ?? Math.round((startW / full) * 100);
        dom.classList.add("is-resizing");
        const move = (ev) => {
          const dx = (ev.clientX - startX) * (side === "l" ? -1 : 1);
          pct = snap(
            Math.max(10, Math.min(100, Math.round(((startW + dx) / full) * 100))),
          );
          dom.style.width = `${pct}%`;
          badge.textContent = `${pct}%`;
        };
        const up = () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          dom.classList.remove("is-resizing");
          const pos = getPos();
          if (typeof pos === "number")
            editor
              .chain()
              .setNodeSelection(pos)
              .updateAttributes("image", { width: pct })
              .run();
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      };
      handles.forEach((h) => h.addEventListener("pointerdown", onDown));

      return {
        dom,
        update(n) {
          if (n.type !== current.type) return false;
          current = n;
          apply(n);
          return true;
        },
        stopEvent: (e) =>
          e.target instanceof HTMLElement &&
          e.target.classList.contains("rte-img-handle"),
        ignoreMutation: () => true,
        destroy: () =>
          handles.forEach((h) => h.removeEventListener("pointerdown", onDown)),
      };
    };
  },
});

/**
 * Only what the quotation PDF can draw: h3 section heading, h4 sub-heading,
 * paragraphs, bold/italic/underline, bullet + numbered lists, tables, pictures,
 * left/centre/right alignment.
 */
export function buildExtensions({ placeholder = "" } = {}) {
  return [
    StarterKit.configure({
      heading: { levels: [3, 4] },
      blockquote: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      strike: false,
      link: false,
    }),
    SizedImage.configure({ allowBase64: true, inline: true }),
    TextAlign.configure({
      types: ["paragraph", "heading"],
      alignments: ["left", "center", "right"],
    }),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({ placeholder }),
  ];
}
