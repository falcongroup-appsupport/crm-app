import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import headerImg from "../../../../assets/pdf/letterhead-header.jpg";
import footerImg from "../../../../assets/pdf/letterhead-footer.jpg";
import { amountInWords } from "../../../../shared/utils/amountInWords";
import { computeItem } from "../schemas/quotation.schema";
import { parseContent, toSections } from "./parseContent";
import { CONTACT, INTRO_TEXT } from "./pdfContent";

// no mid-word hyphenation
Font.registerHyphenationCallback((word) => [word]);

const RED = "#C8102E";
const INK = "#111";
const LINE = "#333";
const PAGE_W = 595.28;
const HEADER_H = 121;
const FOOTER_H = 23;
const SIDE = 44;
const CONTENT_W = PAGE_W - SIDE * 2;

const s = StyleSheet.create({
  page: {
    paddingTop: HEADER_H + 12,
    paddingBottom: FOOTER_H + 20,
    paddingHorizontal: SIDE,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: INK,
    lineHeight: 1.45,
  },
  header: { position: "absolute", top: 0, left: 0, width: PAGE_W, height: HEADER_H },
  footer: { position: "absolute", bottom: 0, left: 0, width: PAGE_W, height: FOOTER_H },
  h1: {
    color: RED,
    fontSize: 10.5,
    letterSpacing: 0.3,
    marginTop: 14,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  h2: {
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#F0F0F0",
    paddingVertical: 2,
    paddingHorizontal: 3,
    marginTop: 8,
    marginBottom: 5,
  },
  p: { marginBottom: 5 },
  bold: { fontFamily: "Helvetica-Bold" },
  bulletRow: { flexDirection: "row", marginBottom: 3.5 },
  dot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: RED,
    marginRight: 9,
    marginLeft: 6,
    marginTop: 4.5,
  },
  marker: { width: 16, marginRight: 4, marginLeft: 6 },
  bulletText: { flex: 1 },
  table: { borderWidth: 0.8, borderColor: LINE, marginVertical: 6 },
  tr: { flexDirection: "row", borderTopWidth: 0.8, borderTopColor: LINE },
  td: { fontSize: 9, padding: 5, borderRightWidth: 0.8, borderRightColor: LINE },
  th: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    padding: 5,
    color: "#fff",
    backgroundColor: "#111",
    borderRightWidth: 0.8,
    borderRightColor: "#555",
    textAlign: "center",
  },
  center: { textAlign: "center" },
  right: { textAlign: "right" },
});

// ---- helpers --------------------------------------------------------------

const money = (v) =>
  Number(v ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ordinal = (n) => {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th"}`;
};

function dateLong(d) {
  if (!d) return "";
  const dt = new Date(`${String(d).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return String(d);
  const month = dt.toLocaleDateString("en-GB", { month: "long" });
  return `${ordinal(dt.getDate())} ${month} ${dt.getFullYear()}`;
}

const splitLines = (t) =>
  String(t ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);

const joinNames = (names) =>
  names.length <= 1
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;

// "Scope of Services-:" / "General Considerations: -" → "Scope of Services"
const cleanTitle = (t) =>
  String(t ?? "")
    .replace(/[\s:–-]+$/, "")
    .trim();

const fontOf = (r) =>
  r.b && r.i
    ? "Helvetica-BoldOblique"
    : r.b
      ? "Helvetica-Bold"
      : r.i
        ? "Helvetica-Oblique"
        : undefined;

/** Inline runs ({ text, b, i, u }) as nested <Text>. */
function Runs({ runs }) {
  return runs.map((r, i) => (
    <Text
      key={i}
      style={{
        ...(fontOf(r) ? { fontFamily: fontOf(r) } : {}),
        ...(r.u ? { textDecoration: "underline" } : {}),
      }}
    >
      {r.text}
    </Text>
  ));
}

const isStyled = (runs) => runs?.some((r) => r.b || r.i || r.u);

function Bullet({ text, runs, level = 0, marker = null }) {
  const plainText = text ?? runs?.map((r) => r.text).join("") ?? "";
  return (
    <View style={[s.bulletRow, { paddingLeft: level * 16 }]} wrap={false}>
      {marker ? <Text style={s.marker}>{marker}</Text> : <View style={s.dot} />}
      <Text style={s.bulletText}>
        {isStyled(runs) ? <Runs runs={runs} /> : plainText}
      </Text>
    </View>
  );
}

const JUSTIFY = { left: "flex-start", center: "center", right: "flex-end" };

function ImageRow({ items, align }) {
  const several = items.length > 1;
  return (
    <View
      wrap={false}
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: JUSTIFY[align] ?? "center",
        alignItems: "flex-start",
        marginVertical: 6,
      }}
    >
      {items.map((it, i) => (
        <Image
          key={i}
          src={it.src}
          style={{
            // width is a % of the text width; without one, fit a row of images
            width: it.width
              ? (it.width / 100) * CONTENT_W - (several ? 4 : 0)
              : several
                ? CONTENT_W / items.length - 6
                : Math.min(CONTENT_W, 330),
            maxHeight: 260,
            objectFit: "contain",
            marginHorizontal: several ? 2 : 0,
          }}
        />
      ))}
    </View>
  );
}

function TableBlock({ rows }) {
  const cols = Math.max(...rows.map((r) => r.length));
  return (
    <View style={s.table} wrap={rows.length > 14}>
      {rows.map((row, ri) => (
        <View key={ri} style={ri ? s.tr : { flexDirection: "row" }} wrap={false}>
          {Array.from({ length: cols }, (_, ci) => {
            const cell = row[ci];
            return (
              <View
                key={ci}
                style={[
                  s.td,
                  { flex: 1 },
                  cell?.header ? { backgroundColor: "#F3F3F3" } : {},
                  ci === cols - 1 ? { borderRightWidth: 0 } : {},
                ]}
              >
                <Text style={cell?.header ? s.bold : undefined}>
                  {cell?.runs?.length ? <Runs runs={cell.runs} /> : ""}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function Blocks({ blocks }) {
  return blocks.map((b, i) => {
    switch (b.type) {
      case "subheading":
        return (
          <Text key={i} style={s.h2} minPresenceAhead={40}>
            {b.text}
          </Text>
        );
      case "bullet":
        return (
          <Bullet key={i} text={b.text} runs={b.runs} level={b.level} marker={b.marker} />
        );
      case "table":
        return <TableBlock key={i} rows={b.rows} />;
      case "images":
        return <ImageRow key={i} items={b.items} align={b.align} />;
      default:
        return (
          <Text key={i} style={[s.p, { textAlign: b.align ?? "left" }]}>
            {b.runs ? <Runs runs={b.runs} /> : b.text}
          </Text>
        );
    }
  });
}

const Heading = ({ children }) => (
  <Text style={s.h1} minPresenceAhead={50}>
    {children}: -
  </Text>
);

// ---- sections drawn from the quotation data -------------------------------

function TimeSchedule({ q }) {
  const rows = (q.durations ?? []).filter(
    (d) => d.description || Number(d.duration) > 0 || d.remarks,
  );
  if (!rows.length) return null;
  const when = (d) =>
    [Number(d.duration) > 0 ? `${Number(d.duration)} ${d.unit || "Days"}` : "", d.remarks]
      .filter(Boolean)
      .join(" — ");
  return (
    <View wrap={false}>
      <Heading>Time Schedule</Heading>
      <View style={s.table}>
        {rows.map((d, i) => (
          <View key={i} style={i ? s.tr : { flexDirection: "row" }} wrap={false}>
            <Text style={[s.td, s.bold, { width: 150 }]}>{d.description}</Text>
            <Text style={[s.td, { flex: 1, borderRightWidth: 0 }]}>{when(d) || "-"}</Text>
          </View>
        ))}
        {Number(q.estimatedTotalDays) > 0 && (
          <View style={s.tr} wrap={false}>
            <Text style={[s.td, s.bold, { width: 150 }]}>Estimated Calendar Days</Text>
            <Text style={[s.td, s.bold, { flex: 1, borderRightWidth: 0 }]}>
              {Number(q.estimatedTotalDays)} Days
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const COL = { n: 28, unit: 36, qty: 32, rate: 60, vat: 56, amount: 66 };

function Financial({ q }) {
  const currency = q.currency || "AED";
  const items = (q.items ?? []).map((it) => ({ ...it, ...computeItem(it) }));
  const subtotal = q.subtotal ?? items.reduce((t, i) => t + i.amount, 0);
  const salesTax = q.salesTax ?? items.reduce((t, i) => t + i.vatAED, 0);
  const discount = Number(q.discount ?? 0);
  const total = q.total ?? subtotal + salesTax - discount;
  const vatPct = Number(
    items.find((i) => Number(i.vatPercentage) > 0)?.vatPercentage ?? 0,
  );
  const head = (w, label, extra) => (
    <Text style={[s.th, w ? { width: w } : { flex: 1 }, extra]}>{label}</Text>
  );
  return (
    <View wrap={false}>
      <Heading>Financial</Heading>
      <View style={s.table}>
        <View style={{ flexDirection: "row" }} wrap={false}>
          <Text
            style={[s.td, s.bold, { flex: 1, borderRightWidth: 0, textAlign: "center" }]}
          >
            Project: {q.projectName}
          </Text>
        </View>
        <View style={s.tr} wrap={false}>
          {head(COL.n, "#")}
          {head(0, "Description")}
          {head(COL.unit, "Unit")}
          {head(COL.qty, "Qty")}
          {head(COL.rate, `Rate (${currency})`)}
          {head(COL.vat, vatPct ? `VAT (${vatPct}%)` : "VAT")}
          {head(COL.amount, `Amount (${currency})`, { borderRightWidth: 0 })}
        </View>
        {items.map((it, i) => (
          <View key={i} style={s.tr} wrap={false}>
            <Text style={[s.td, s.bold, s.center, { width: COL.n }]}>{i + 1}</Text>
            <Text style={[s.td, { flex: 1 }]}>
              {it.itemDescription || it.activityName}
            </Text>
            <Text style={[s.td, s.center, { width: COL.unit }]}>{it.unit}</Text>
            <Text style={[s.td, s.center, { width: COL.qty }]}>
              {Number(it.quantity)}
            </Text>
            <Text style={[s.td, s.right, { width: COL.rate }]}>{money(it.rate)}</Text>
            <Text style={[s.td, s.right, { width: COL.vat }]}>{money(it.vatAED)}</Text>
            <Text style={[s.td, s.right, { width: COL.amount, borderRightWidth: 0 }]}>
              {money(it.totalAED)}
            </Text>
          </View>
        ))}
        {discount > 0 && (
          <View style={s.tr} wrap={false}>
            <Text style={[s.td, s.bold, s.right, { flex: 1 }]}>Discount</Text>
            <Text style={[s.td, s.right, { width: COL.amount, borderRightWidth: 0 }]}>
              - {money(discount)}
            </Text>
          </View>
        )}
        <View style={s.tr} wrap={false}>
          <Text style={[s.td, s.bold, s.right, { flex: 1, fontSize: 10.5 }]}>
            Total Amount
          </Text>
          <Text
            style={[
              s.td,
              s.bold,
              s.right,
              { width: COL.amount + 10, fontSize: 10.5, borderRightWidth: 0 },
            ]}
          >
            {money(total)}
          </Text>
        </View>
        <View style={s.tr} wrap={false}>
          <Text style={[s.td, s.bold, s.right, { flex: 1, borderRightWidth: 0 }]}>
            In Words: {amountInWords(total, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function BulletSection({ title, lines }) {
  if (!lines.length) return null;
  return (
    <View>
      <Heading>{title}</Heading>
      {lines.map((t, i) => (
        <Bullet key={i} text={t} />
      ))}
    </View>
  );
}

function Contact() {
  return (
    <View wrap={false}>
      <Heading>Contact Details</Heading>
      <Text style={s.p}>
        The contact details for any enquiry to do with this response are:
      </Text>
      <Text style={[s.bold, { marginTop: 4 }]}>{CONTACT.person}</Text>
      <Text style={{ marginBottom: 8 }}>{CONTACT.role}</Text>
      <Text style={{ fontSize: 10.5 }}>{CONTACT.company}</Text>
      {CONTACT.address.map((l) => (
        <Text key={l}>{l}</Text>
      ))}
      <Text>{CONTACT.phone}</Text>
      <Text style={{ color: RED, marginTop: 6, letterSpacing: 0.5 }}>
        {CONTACT.branches.join("    •    ")}
      </Text>
    </View>
  );
}

// ---- document -------------------------------------------------------------

/**
 * Sales quotation PDF (GET /api/quotation/{id}).
 * The four template sections (scope of services, general considerations, reporting &
 * deliverables, equipment & personnel — whatever headings the template has) come from
 * `templateContents`; everything else is drawn from the quotation data.
 */
export function QuotationPdf({ quotation: q }) {
  const names = [...new Set((q.items ?? []).map((i) => i.activityName).filter(Boolean))];
  const a = q.customerAddress ?? {};
  const address = [
    ...new Set(
      [
        a.officeNumber,
        a.buildingCommunityName,
        a.streetAddress,
        a.area,
        a.city,
        a.emirate,
        a.poBox && `P.O. Box ${a.poBox}`,
      ].filter(Boolean),
    ),
  ].join(", ");
  const sections = toSections(parseContent(q.templateContents));
  if (!sections.length && names.length)
    sections.push({
      title: "Scope of Services",
      blocks: names.map((text) => ({ type: "bullet", text, level: 0, marker: null })),
    });
  const ref = q.quotationNo || "";
  const validity = Number(q.quotationValidity);
  const tcLines = [
    ...splitLines(q.termsAndConditions),
    ...(validity > 0
      ? [`This quotation is valid for ${validity} days from the date of submission.`]
      : []),
  ];

  return (
    <Document title={ref || "Quotation"} author="Falcon Survey Engineering">
      <Page size="A4" style={s.page}>
        <Image fixed src={headerImg} style={s.header} />
        <Image fixed src={footerImg} style={s.footer} />

        <Text
          style={{ fontSize: 24, lineHeight: 1.2, letterSpacing: 1, marginBottom: 4 }}
        >
          QUOTATION
        </Text>
        <Text style={{ marginBottom: 10 }}>{dateLong(q.quotationDate)}</Text>

        <View style={{ flexDirection: "row", marginBottom: 8 }} wrap={false}>
          <View style={{ flex: 1.5, paddingRight: 10 }}>
            <Text style={{ fontSize: 8.5, marginBottom: 2 }}>To</Text>
            <Text style={[s.bold, { fontSize: 11 }]}>{q.customerName}</Text>
            {q.attentionTo ? <Text>Attn: {q.attentionTo}</Text> : null}
            {address ? <Text>{address}</Text> : null}
            {q.contactNumber || q.emailId ? (
              <Text>
                {[q.contactNumber && `Tel.: ${q.contactNumber}`, q.emailId]
                  .filter(Boolean)
                  .join("   •   ")}
              </Text>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            {[
              ["Quote No.", ref],
              ["Currency", q.currency || "AED"],
              ["Validity", validity > 0 ? `${validity} days` : ""],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <View key={k} style={{ flexDirection: "row", marginBottom: 2 }}>
                  <Text style={{ width: 62, fontSize: 9 }}>{k}</Text>
                  <Text style={{ flex: 1, fontSize: 9 }}>{v}</Text>
                </View>
              ))}
          </View>
        </View>

        <View
          wrap={false}
          style={{
            borderTopWidth: 0.8,
            borderBottomWidth: 0.8,
            borderColor: LINE,
            paddingVertical: 4,
            marginBottom: 8,
          }}
        >
          <Text style={[s.bold, s.center]}>Project: {q.projectName}</Text>
          {names.length > 0 && (
            <Text style={[s.bold, s.center]}>
              Subject: Quotation for {joinNames(names)}
            </Text>
          )}
        </View>

        <Text style={s.p}>{INTRO_TEXT}</Text>

        {/* template sections */}
        {sections.map((sec, i) => (
          <View key={i}>
            <View wrap={false}>
              <Heading>{cleanTitle(sec.title)}</Heading>
              <Blocks blocks={sec.blocks.slice(0, 2)} />
            </View>
            <Blocks blocks={sec.blocks.slice(2)} />
          </View>
        ))}

        <TimeSchedule q={q} />
        <Financial q={q} />
        <BulletSection
          title="Terms of Payment"
          lines={splitLines(q.detailedPaymentTerms)}
        />
        <BulletSection title="Terms and Conditions of this Offer" lines={tcLines} />
        <Contact />
      </Page>
    </Document>
  );
}
