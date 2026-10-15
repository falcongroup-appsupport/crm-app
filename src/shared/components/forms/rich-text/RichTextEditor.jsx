import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Bold,
  Columns3,
  Crop,
  Eraser,
  FilePlus2,
  ImagePlus,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  PanelLeft,
  Redo2,
  RefreshCw,
  Rows3,
  Table2,
  TableProperties,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { cn } from "../../../utils/cn";
import { ImageCropDialog } from "../ImageCropDialog";
import { buildExtensions } from "./extensions";
import {
  MenuItem,
  RibbonButton,
  RibbonGroup,
  RibbonMenu,
  RibbonTab,
  Row,
  Rows,
} from "./Ribbon";
import { TableGridPicker } from "./TableGridPicker";
import { OutlinePane } from "./OutlinePane";
import "../richText.css";

const WIDTHS = [25, 33, 50, 75, 100];
const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "⌘" : "Ctrl";
const kb = (s) => s.replace("Mod", MOD);

const STYLES = [
  {
    key: "p",
    name: "Normal",
    sample: <span className="text-[13px] text-ink-800">AaBbCc</span>,
    shortcut: "Mod+Alt+0",
  },
  {
    key: "h3",
    name: "Section",
    sample: (
      <span className="text-[11px] uppercase tracking-wide text-signal-600">
        Section: -
      </span>
    ),
    shortcut: "Mod+Alt+3",
  },
  {
    key: "h4",
    name: "Sub-heading",
    sample: (
      <span className="rounded-sm bg-ink-100 px-1 text-[12px] font-bold text-ink-800">
        AaBbCc
      </span>
    ),
    shortcut: "Mod+Alt+4",
  },
];

const EMPTY_STATE = {
  style: "p",
  align: "left",
  headings: [],
  images: 0,
  words: 0,
  imgWidth: null,
};

function readState(ed) {
  const headings = [];
  let images = 0;
  ed.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading")
      headings.push({ pos, level: node.attrs.level, text: node.textContent.trim() });
    else if (node.type.name === "image") images += 1;
  });
  const words = ed.getText().split(/\s+/).filter(Boolean).length;
  return {
    style: ed.isActive("heading", { level: 3 })
      ? "h3"
      : ed.isActive("heading", { level: 4 })
        ? "h4"
        : "p",
    bold: ed.isActive("bold"),
    italic: ed.isActive("italic"),
    underline: ed.isActive("underline"),
    bullet: ed.isActive("bulletList"),
    ordered: ed.isActive("orderedList"),
    align: ed.isActive({ textAlign: "center" })
      ? "center"
      : ed.isActive({ textAlign: "right" })
        ? "right"
        : "left",
    canSink: ed.can().sinkListItem("listItem"),
    canLift: ed.can().liftListItem("listItem"),
    canUndo: ed.can().undo(),
    canRedo: ed.can().redo(),
    isImage: ed.isActive("image"),
    imgWidth: ed.isActive("image") ? (ed.getAttributes("image").width ?? null) : null,
    inTable: ed.isActive("table"),
    headings,
    images,
    words,
  };
}

const imageFile = (list) =>
  [...(list ?? [])].find((f) => f.type?.startsWith("image/")) ?? null;

/**
 * Word-style editor for the quotation template sections. `value` / `onChange` carry HTML.
 *  - h3 = section heading ("SCOPE OF SERVICES: -" in the PDF), h4 = sub-heading band
 *  - pictures: crop on insert, drag the side handles (or pick a %) to resize,
 *    paste / drop images straight in
 *  - `actions` renders extra controls at the right of the tab strip
 *  - `sections` = section titles offered under Insert → Section
 *  - `maxChars` drives the size meter in the status bar
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing, or load a template…",
  actions,
  onError,
  sections = [],
  maxChars,
}) {
  const lastEmitted = useRef(value ?? "");
  const fileRef = useRef(null);
  const replaceRef = useRef(null);
  const [crop, setCrop] = useState(null); // { src, mode: "new" | "replace" | "recrop", pos }
  const [userTab, setUserTab] = useState(null);
  const [baseTab, setBaseTab] = useState("home");
  const [outline, setOutline] = useState(true);
  const [full, setFull] = useState(false);

  const editor = useEditor({
    extensions: buildExtensions({ placeholder }),
    content: value || "",
    editorProps: {
      attributes: { class: "rte-content rte-page-body", spellcheck: "true" },
      // paste a screenshot / copied picture → crop dialog (Word text pastes stay text)
      handlePaste: (view, event) => {
        const file = imageFile(event.clipboardData?.files);
        if (!file) return false;
        const html = event.clipboardData.getData("text/html");
        if (html && html.replace(/<[^>]+>/g, "").trim()) return false;
        setCrop({
          src: URL.createObjectURL(file),
          mode: "new",
          pos: view.state.selection.from,
        });
        return true;
      },
      handleDrop: (view, event) => {
        const file = imageFile(event.dataTransfer?.files);
        if (!file) return false;
        event.preventDefault();
        setCrop({
          src: URL.createObjectURL(file),
          mode: "new",
          pos: view.state.selection.from,
        });
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.isEmpty ? "" : ed.getHTML();
      lastEmitted.current = html;
      onChange?.(html);
    },
  });

  // external changes (template load, Word upload, blank sections) — not our own keystrokes
  useEffect(() => {
    if (!editor) return;
    if ((value ?? "") !== lastEmitted.current) {
      lastEmitted.current = value ?? "";
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  // contextual tabs (Picture / Table) follow the selection, like Word's "Picture Format"
  useEffect(() => {
    if (!editor) return;
    let prev = null;
    const onSel = () => {
      const ctx = editor.isActive("image")
        ? "picture"
        : editor.isActive("table")
          ? "table"
          : null;
      if (ctx !== prev) {
        prev = ctx;
        setUserTab(null);
      }
    };
    editor.on("selectionUpdate", onSel);
    return () => editor.off("selectionUpdate", onSel);
  }, [editor]);

  // full-screen: Esc leaves, page behind doesn't scroll
  useEffect(() => {
    if (!full) return;
    const esc = (e) =>
      e.key === "Escape" && !document.querySelector("[role=dialog]") && setFull(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", esc);
    };
  }, [full]);

  const state = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed) return EMPTY_STATE;
      try {
        return readState(ed);
      } catch {
        // the view isn't mounted yet (first render) — commands can't be checked
        return EMPTY_STATE;
      }
    },
  });

  if (!editor) return null;
  const chain = () => editor.chain().focus();

  // ---- pictures -------------------------------------------------------------
  const openCrop = (file, mode) => {
    if (!file.type.startsWith("image/")) {
      onError?.("Please choose an image file.");
      return;
    }
    setCrop({ src: URL.createObjectURL(file), mode, pos: editor.state.selection.from });
  };

  const closeCrop = () =>
    setCrop((c) => {
      if (c?.src.startsWith("blob:")) URL.revokeObjectURL(c.src);
      return null;
    });

  const onCropped = (dataUrl) => {
    if (crop?.mode === "new") {
      chain().setImage({ src: dataUrl, alt: "", width: 50 }).run();
    } else {
      chain()
        .setNodeSelection(crop.pos)
        .updateAttributes("image", { src: dataUrl })
        .run();
    }
    closeCrop();
  };

  const pick = (mode) => (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) openCrop(file, mode);
  };

  const recrop = () => {
    const { src } = editor.getAttributes("image");
    if (src) setCrop({ src, mode: "recrop", pos: editor.state.selection.from });
  };

  // ---- tabs -----------------------------------------------------------------
  const contextual = state.isImage ? "picture" : state.inTable ? "table" : null;
  const tab = userTab ?? contextual ?? baseTab;
  const goTab = (t) => {
    setUserTab(t);
    if (t === "home" || t === "insert") setBaseTab(t);
  };

  const setStyle = (key) => {
    if (key === "p") chain().setParagraph().run();
    else
      chain()
        .setHeading({ level: key === "h3" ? 3 : 4 })
        .run();
  };

  const insertSection = (title) =>
    chain()
      .insertContent(
        `<h3>${title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</h3><ul><li><p></p></li></ul>`,
      )
      .run();

  const jump = (pos) => {
    chain()
      .setTextSelection(pos + 1)
      .scrollIntoView()
      .run();
    const dom = editor.view.nodeDOM(pos);
    if (dom instanceof HTMLElement)
      dom.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const size = (value ?? "").length;
  const sizeLabel =
    size >= 1_000_000
      ? `${(size / 1_000_000).toFixed(1)} MB`
      : `${Math.max(1, Math.round(size / 1000))} KB`;
  const sizeWarn = maxChars && size > maxChars * 0.8;

  const align = (
    <>
      <RibbonButton
        icon={AlignLeft}
        label="Align left"
        shortcut={kb("Mod+Shift+L")}
        active={state.align === "left"}
        onClick={() => chain().setTextAlign("left").run()}
      />
      <RibbonButton
        icon={AlignCenter}
        label="Centre"
        shortcut={kb("Mod+Shift+E")}
        active={state.align === "center"}
        onClick={() => chain().setTextAlign("center").run()}
      />
      <RibbonButton
        icon={AlignRight}
        label="Align right"
        shortcut={kb("Mod+Shift+R")}
        active={state.align === "right"}
        onClick={() => chain().setTextAlign("right").run()}
      />
    </>
  );

  return (
    <div
      className={cn(
        "@container flex flex-col rounded-xl bg-white ring-1 ring-ink-200 dark:bg-ink-900 dark:ring-ink-700",
        full && "fixed inset-0 z-[65] rounded-none ring-0",
      )}
    >
      {/* tab strip */}
      <div className="flex flex-wrap items-center gap-x-2 border-b border-ink-200 px-2 dark:border-ink-700">
        <div role="tablist" className="flex items-center">
          <RibbonTab active={tab === "home"} onClick={() => goTab("home")}>
            Home
          </RibbonTab>
          <RibbonTab active={tab === "insert"} onClick={() => goTab("insert")}>
            Insert
          </RibbonTab>
          {state.isImage && (
            <RibbonTab
              contextual
              active={tab === "picture"}
              onClick={() => goTab("picture")}
            >
              Picture
            </RibbonTab>
          )}
          {state.inTable && (
            <RibbonTab contextual active={tab === "table"} onClick={() => goTab("table")}>
              Table
            </RibbonTab>
          )}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1.5 py-1.5">
          {actions}
          <RibbonButton
            icon={PanelLeft}
            label={outline ? "Hide navigation" : "Show navigation"}
            active={outline}
            onClick={() => setOutline((o) => !o)}
            className="hidden @4xl:inline-flex"
          />
          <RibbonButton
            icon={full ? Minimize2 : Maximize2}
            label={full ? "Exit full screen (Esc)" : "Full screen"}
            onClick={() => setFull((f) => !f)}
          />
        </div>
      </div>

      {/* ribbon */}
      <div className="flex flex-wrap items-stretch gap-y-1 border-b border-ink-200 bg-ink-50 px-1 py-1.5 dark:border-ink-700 dark:bg-ink-900/60">
        {tab === "home" && (
          <>
            <RibbonGroup label="Undo">
              <Rows>
                <RibbonButton
                  icon={Undo2}
                  label="Undo"
                  shortcut={kb("Mod+Z")}
                  disabled={!state.canUndo}
                  onClick={() => chain().undo().run()}
                />
                <RibbonButton
                  icon={Redo2}
                  label="Redo"
                  shortcut={kb("Mod+Y")}
                  disabled={!state.canRedo}
                  onClick={() => chain().redo().run()}
                />
              </Rows>
            </RibbonGroup>
            <RibbonGroup label="Font">
              <Rows>
                <Row>
                  <RibbonButton
                    icon={Bold}
                    label="Bold"
                    shortcut={kb("Mod+B")}
                    active={state.bold}
                    onClick={() => chain().toggleBold().run()}
                  />
                  <RibbonButton
                    icon={Italic}
                    label="Italic"
                    shortcut={kb("Mod+I")}
                    active={state.italic}
                    onClick={() => chain().toggleItalic().run()}
                  />
                  <RibbonButton
                    icon={UnderlineIcon}
                    label="Underline"
                    shortcut={kb("Mod+U")}
                    active={state.underline}
                    onClick={() => chain().toggleUnderline().run()}
                  />
                </Row>
                <Row>
                  <RibbonButton
                    icon={Eraser}
                    label="Clear formatting"
                    onClick={() => chain().unsetAllMarks().clearNodes().run()}
                  />
                </Row>
              </Rows>
            </RibbonGroup>
            <RibbonGroup label="Paragraph">
              <Rows>
                <Row>
                  <RibbonButton
                    icon={List}
                    label="Bullets"
                    shortcut={kb("Mod+Shift+8")}
                    active={state.bullet}
                    onClick={() => chain().toggleBulletList().run()}
                  />
                  <RibbonButton
                    icon={ListOrdered}
                    label="Numbering"
                    shortcut={kb("Mod+Shift+7")}
                    active={state.ordered}
                    onClick={() => chain().toggleOrderedList().run()}
                  />
                  <RibbonButton
                    icon={IndentDecrease}
                    label="Decrease indent"
                    shortcut="Shift+Tab"
                    disabled={!state.canLift}
                    onClick={() => chain().liftListItem("listItem").run()}
                  />
                  <RibbonButton
                    icon={IndentIncrease}
                    label="Increase indent"
                    shortcut="Tab"
                    disabled={!state.canSink}
                    onClick={() => chain().sinkListItem("listItem").run()}
                  />
                </Row>
                <Row>{align}</Row>
              </Rows>
            </RibbonGroup>
            <RibbonGroup label="Styles">
              <div className="flex gap-1">
                {STYLES.map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    title={`${st.name} (${kb(st.shortcut)})`}
                    aria-pressed={state.style === st.key}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setStyle(st.key)}
                    className={cn(
                      // tiles stay white like the page, so the samples read the same in dark mode
                      "flex h-[3.75rem] w-[5.5rem] flex-col items-start justify-between rounded-md bg-white px-2 py-1.5 text-left ring-1 ring-inset ring-ink-200 transition hover:ring-ink-400 dark:ring-ink-600",
                      state.style === st.key &&
                        "ring-2 ring-signal-500 hover:ring-signal-500 dark:ring-signal-500",
                    )}
                  >
                    {st.sample}
                    <span className="text-[10px] text-ink-500">{st.name}</span>
                  </button>
                ))}
              </div>
            </RibbonGroup>
          </>
        )}

        {tab === "insert" && (
          <>
            <RibbonGroup label="Illustrations">
              <RibbonButton
                large
                icon={ImagePlus}
                label="Picture"
                onClick={() => fileRef.current?.click()}
              />
            </RibbonGroup>
            <RibbonGroup label="Tables">
              <RibbonMenu
                large
                icon={<Table2 className="h-6 w-6" strokeWidth={1.6} />}
                label="Table"
              >
                {(close) => (
                  <TableGridPicker
                    onPick={(rows, cols) => {
                      chain().insertTable({ rows, cols, withHeaderRow: true }).run();
                      close();
                    }}
                  />
                )}
              </RibbonMenu>
            </RibbonGroup>
            <RibbonGroup label="Sections">
              <RibbonMenu
                large
                icon={<FilePlus2 className="h-6 w-6" strokeWidth={1.6} />}
                label="Section"
                panelClassName="w-64"
              >
                {(close) => (
                  <>
                    <p className="px-2.5 pb-1 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                      Insert section heading
                    </p>
                    {sections.map((t) => (
                      <MenuItem key={t} onClick={() => (insertSection(t), close())}>
                        {t}
                      </MenuItem>
                    ))}
                    <MenuItem
                      onClick={() => {
                        chain().setHeading({ level: 3 }).run();
                        close();
                      }}
                      hint={kb("Mod+Alt+3")}
                    >
                      Custom heading
                    </MenuItem>
                  </>
                )}
              </RibbonMenu>
            </RibbonGroup>
            <p className="hidden self-center px-3 text-xs text-ink-400 @3xl:block">
              Tip: paste or drag a picture straight onto the page.
            </p>
          </>
        )}

        {tab === "picture" && (
          <>
            <RibbonGroup label="Adjust">
              <RibbonButton large icon={Crop} label="Crop" onClick={recrop} />
              <RibbonButton
                large
                icon={RefreshCw}
                label="Replace"
                onClick={() => replaceRef.current?.click()}
              />
            </RibbonGroup>
            <RibbonGroup label="Size (% of page width)">
              <div className="flex items-center gap-0.5">
                {WIDTHS.map((w) => (
                  <RibbonButton
                    key={w}
                    showLabel
                    label={`${w}%`}
                    active={state.imgWidth === w}
                    onClick={() => chain().updateAttributes("image", { width: w }).run()}
                  />
                ))}
              </div>
            </RibbonGroup>
            <RibbonGroup label="Position">
              <Row>{align}</Row>
            </RibbonGroup>
            <RibbonGroup label="Delete">
              <RibbonButton
                large
                icon={Trash2}
                label="Remove"
                onClick={() => chain().deleteSelection().run()}
              />
            </RibbonGroup>
            <p className="hidden self-center px-3 text-xs text-ink-400 @3xl:block">
              Drag the handles on the picture to resize. Pictures in the same line sit
              side by side.
            </p>
          </>
        )}

        {tab === "table" && (
          <>
            <RibbonGroup label="Rows">
              <Rows>
                <RibbonButton
                  icon={ArrowUpToLine}
                  showLabel
                  label="Insert above"
                  onClick={() => chain().addRowBefore().run()}
                />
                <RibbonButton
                  icon={ArrowDownToLine}
                  showLabel
                  label="Insert below"
                  onClick={() => chain().addRowAfter().run()}
                />
              </Rows>
            </RibbonGroup>
            <RibbonGroup label="Columns">
              <Rows>
                <RibbonButton
                  icon={ArrowLeftToLine}
                  showLabel
                  label="Insert left"
                  onClick={() => chain().addColumnBefore().run()}
                />
                <RibbonButton
                  icon={ArrowRightToLine}
                  showLabel
                  label="Insert right"
                  onClick={() => chain().addColumnAfter().run()}
                />
              </Rows>
            </RibbonGroup>
            <RibbonGroup label="Delete">
              <Rows>
                <RibbonButton
                  icon={Rows3}
                  showLabel
                  label="Delete row"
                  onClick={() => chain().deleteRow().run()}
                />
                <RibbonButton
                  icon={Columns3}
                  showLabel
                  label="Delete column"
                  onClick={() => chain().deleteColumn().run()}
                />
              </Rows>
              <RibbonButton
                large
                icon={Trash2}
                label="Delete table"
                onClick={() => chain().deleteTable().run()}
              />
            </RibbonGroup>
            <RibbonGroup label="Style">
              <RibbonButton
                large
                icon={TableProperties}
                label="Header row"
                onClick={() => chain().toggleHeaderRow().run()}
              />
            </RibbonGroup>
          </>
        )}
      </div>

      {/* page canvas */}
      <div
        className={cn(
          "flex min-h-0 bg-ink-100 dark:bg-ink-950",
          full ? "flex-1" : "h-[72vh] min-h-[28rem]",
        )}
      >
        {outline && (
          <OutlinePane
            headings={state.headings}
            onJump={jump}
            className="hidden @4xl:block"
          />
        )}
        <div className="min-w-0 flex-1 overflow-y-auto px-3 py-6 sm:px-6">
          <div className="rte-page">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* status bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-b-xl border-t border-ink-200 bg-ink-50 px-3 py-1.5 text-[11px] text-ink-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-400">
        <span>{state.headings.filter((h) => h.level === 3).length} sections</span>
        <span>{state.words.toLocaleString()} words</span>
        <span>{state.images} pictures</span>
        <span
          className={cn(
            "ml-auto",
            sizeWarn && "font-medium text-signal-600 dark:text-signal-400",
          )}
        >
          {sizeLabel}
          {maxChars ? ` of ${Math.round(maxChars / 1_000_000)} MB` : ""}
          {sizeWarn ? " — use smaller pictures" : ""}
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={pick("new")}
      />
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={pick("replace")}
      />
      <ImageCropDialog src={crop?.src} onCancel={closeCrop} onDone={onCropped} />
    </div>
  );
}
