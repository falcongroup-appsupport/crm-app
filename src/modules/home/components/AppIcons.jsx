// Flat, multi-colour app icons for the launcher. Overlapping shapes use
// multiply blending; `isolation: isolate` keeps the blend inside each icon so
// it looks the same on light and dark tiles.

const C = {
  red: "#E63946",
  coral: "#FF7A59",
  amber: "#FBBF24",
  orange: "#F97316",
  teal: "#14B8A6",
  green: "#10B981",
  sky: "#38BDF8",
  blue: "#3B82F6",
  indigo: "#6366F1",
  violet: "#8B5CF6",
  plum: "#9D4E8F",
  ink: "#334155",
};
const mul = { mixBlendMode: "multiply" };
const W = "#FFFFFF";

function Svg({ children, className }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      style={{ isolation: "isolate" }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS = {
  dashboard: (p) => (
    <Svg {...p}>
      <rect x="6" y="6" width="17" height="17" rx="4" fill={C.violet} />
      <rect x="27" y="6" width="15" height="7" rx="3.5" fill={C.red} />
      <rect
        x="27"
        y="16"
        width="15"
        height="7"
        rx="3.5"
        fill={C.coral}
        style={mul}
      />
      <rect x="6" y="27" width="17" height="15" rx="4" fill={C.sky} />
      <rect x="27" y="31" width="6" height="11" rx="2" fill={C.teal} />
      <rect
        x="36"
        y="27"
        width="6"
        height="15"
        rx="2"
        fill={C.green}
        style={mul}
      />
    </Svg>
  ),
  comments: (p) => (
    <Svg {...p}>
      <path
        d="M8 8h32a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H22l-10 8v-8H8a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z"
        fill={C.amber}
      />
      <path
        d="M44 20v10a4 4 0 0 1-4 4H22l-10 8v-8H8a4 4 0 0 1-4-4v-10z"
        fill={C.orange}
        style={mul}
      />
      <rect x="11" y="15" width="22" height="3.5" rx="1.75" fill={W} />
      <rect x="11" y="22" width="14" height="3.5" rx="1.75" fill={W} />
    </Svg>
  ),
  completionLetters: (p) => (
    <Svg {...p}>
      <rect x="5" y="12" width="38" height="27" rx="5" fill={C.indigo} />
      <path
        d="M5 17 24 29 43 17v-.5A4.5 4.5 0 0 0 38.5 12h-29A4.5 4.5 0 0 0 5 16.5z"
        fill={C.violet}
        style={mul}
      />
      <circle cx="36" cy="35" r="9" fill={C.green} />
      <path
        d="M32 35l3 3 5-6"
        stroke={W}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  surveyReports: (p) => (
    <Svg {...p}>
      <rect x="8" y="4" width="30" height="40" rx="4" fill={C.sky} />
      <rect x="14" y="26" width="5" height="11" rx="1.5" fill={W} />
      <rect x="21.5" y="20" width="5" height="17" rx="1.5" fill={W} />
      <rect x="29" y="14" width="5" height="23" rx="1.5" fill={W} />
      <path
        d="M8 8a4 4 0 0 1 4-4h26a4 4 0 0 1 4 4v4H8z"
        fill={C.indigo}
        style={mul}
      />
    </Svg>
  ),
  benchmarks: (p) => (
    <Svg {...p}>
      <path d="M24 6 42 40H6z" fill={C.teal} />
      <path d="M24 6 42 40H24z" fill={C.indigo} style={mul} />
      <rect x="22.5" y="2" width="3" height="20" rx="1.5" fill={C.ink} />
      <path d="M25.5 3h11l-3 4.5 3 4.5h-11z" fill={C.red} />
    </Svg>
  ),
  uom: (p) => (
    <Svg {...p}>
      <rect
        x="3"
        y="15"
        width="42"
        height="18"
        rx="4"
        transform="rotate(-30 24 24)"
        fill={C.amber}
      />
      <rect
        x="3"
        y="24"
        width="42"
        height="9"
        rx="3"
        transform="rotate(-30 24 24)"
        fill={C.orange}
        style={mul}
      />
      <g transform="rotate(-30 24 24)" fill={C.ink}>
        <rect x="10" y="15" width="2.5" height="8" rx="1" />
        <rect x="17" y="15" width="2.5" height="5" rx="1" />
        <rect x="24" y="15" width="2.5" height="8" rx="1" />
        <rect x="31" y="15" width="2.5" height="5" rx="1" />
        <rect x="38" y="15" width="2.5" height="8" rx="1" />
      </g>
    </Svg>
  ),
  enquiries: (p) => (
    <Svg {...p}>
      <rect x="6" y="11" width="36" height="27" rx="5" fill={C.teal} />
      <path
        d="M6 17 24 30 42 17v-1a5 5 0 0 0-5-5H11a5 5 0 0 0-5 5z"
        fill={C.red}
        style={mul}
      />
    </Svg>
  ),
  quotations: (p) => (
    <Svg {...p}>
      <rect x="9" y="5" width="25" height="33" rx="4" fill={C.amber} />
      <rect
        x="14"
        y="12"
        width="15"
        height="3"
        rx="1.5"
        fill={W}
        opacity=".85"
      />
      <rect
        x="14"
        y="18"
        width="10"
        height="3"
        rx="1.5"
        fill={W}
        opacity=".85"
      />
      <circle cx="32" cy="33" r="10" fill={C.red} style={mul} />
    </Svg>
  ),
  followUps: (p) => (
    <Svg {...p}>
      <circle cx="19" cy="20" r="13" fill={C.indigo} />
      <circle cx="30" cy="28" r="12" fill={C.teal} style={mul} />
      <path d="M35 37 43 44l-2-10z" fill={C.teal} />
    </Svg>
  ),
  requests: (p) => (
    <Svg {...p}>
      <path d="M5 13h25V6l13 10.5L30 27v-7H5z" fill={C.sky} />
      <path d="M43 30H18v-7L5 33.5 18 44v-7h25z" fill={C.red} style={mul} />
    </Svg>
  ),
  salesOrders: (p) => (
    <Svg {...p}>
      <path
        d="M17 17v-3a7 7 0 0 1 14 0v3"
        fill="none"
        stroke={C.amber}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M8 17h32l-3 25H11z" fill={C.plum} />
      <path d="M8 17h32l-1.4 11H9.4z" fill={C.coral} style={mul} />
    </Svg>
  ),
  directSales: (p) => (
    <Svg {...p}>
      <path d="M7 8h17l17 17-15 15L7 25z" fill={C.orange} />
      <path d="M24 8l17 17-7.5 7.5-17-17z" fill={C.red} style={mul} />
      <circle cx="15" cy="16" r="3.2" fill={W} />
    </Svg>
  ),
  projects: (p) => (
    <Svg {...p}>
      <rect x="6" y="7" width="10" height="32" rx="3" fill={C.teal} />
      <rect x="19" y="7" width="10" height="21" rx="3" fill={C.violet} />
      <rect x="32" y="7" width="10" height="27" rx="3" fill={C.amber} />
      <rect
        x="6"
        y="7"
        width="36"
        height="7"
        rx="3"
        fill={C.ink}
        opacity=".25"
        style={mul}
      />
    </Svg>
  ),
  planning: (p) => (
    <Svg {...p}>
      <rect x="6" y="9" width="36" height="32" rx="5" fill={C.sky} />
      <path
        d="M11 9h26a5 5 0 0 1 5 5v5H6v-5a5 5 0 0 1 5-5z"
        fill={C.red}
        style={mul}
      />
      <rect x="13" y="5" width="4" height="9" rx="2" fill={C.ink} />
      <rect x="31" y="5" width="4" height="9" rx="2" fill={C.ink} />
      <rect x="12" y="25" width="6" height="5" rx="1.5" fill={W} />
      <rect x="21" y="25" width="6" height="5" rx="1.5" fill={W} />
      <rect x="30" y="25" width="6" height="5" rx="1.5" fill={W} opacity=".6" />
    </Svg>
  ),
  schedules: (p) => (
    <Svg {...p}>
      <circle cx="24" cy="24" r="18" fill={C.indigo} />
      <path d="M24 24V6a18 18 0 0 1 18 18z" fill={C.teal} style={mul} />
      <path
        d="M24 13v11l7 5"
        stroke={W}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  siteVisits: (p) => (
    <Svg {...p}>
      <ellipse cx="24" cy="40" rx="14" ry="4.5" fill={C.teal} />
      <path
        d="M24 4a12.5 12.5 0 0 1 12.5 12.5C36.5 26 24 39 24 39S11.5 26 11.5 16.5A12.5 12.5 0 0 1 24 4z"
        fill={C.red}
        style={mul}
      />
      <circle cx="24" cy="16.5" r="4.5" fill={W} />
    </Svg>
  ),
  materials: (p) => (
    <Svg {...p}>
      <path d="M24 5 41 14 24 23 7 14z" fill={C.amber} />
      <path d="M7 14l17 9v20L7 34z" fill={C.orange} />
      <path d="M41 14 24 23v20l17-9z" fill={C.plum} />
    </Svg>
  ),
  hiring: (p) => (
    <Svg {...p}>
      <circle cx="19" cy="15" r="8" fill={C.violet} />
      <path d="M5 41c0-8.3 6.3-15 14-15s14 6.7 14 15z" fill={C.teal} />
      <rect
        x="27"
        y="21"
        width="15"
        height="15"
        rx="4"
        fill={C.amber}
        style={mul}
      />
    </Svg>
  ),
  design: (p) => (
    <Svg {...p}>
      <path d="M7 42V9l33 33z" fill={C.amber} />
      <path d="M13 36V23.5L25.5 36z" fill={W} />
      <rect
        x="26"
        y="3"
        width="7"
        height="31"
        rx="3.5"
        transform="rotate(35 29.5 18.5)"
        fill={C.red}
        style={mul}
      />
    </Svg>
  ),
  pointClouds: (p) => (
    <Svg {...p}>
      <path
        d="M14 37a9.5 9.5 0 0 1-1.3-18.9A12.5 12.5 0 0 1 36.6 21 8 8 0 0 1 35 37z"
        fill={C.sky}
      />
      <circle cx="17" cy="30" r="2.6" fill={C.indigo} style={mul} />
      <circle cx="24" cy="24" r="2.6" fill={C.indigo} style={mul} />
      <circle cx="31" cy="30" r="2.6" fill={C.red} />
      <circle cx="29" cy="20" r="2" fill={C.indigo} style={mul} />
      <circle cx="23" cy="32" r="2" fill={C.indigo} style={mul} />
    </Svg>
  ),
  settingOut: (p) => (
    <Svg {...p}>
      <circle
        cx="24"
        cy="24"
        r="15.5"
        fill="none"
        stroke={C.teal}
        strokeWidth="6.5"
      />
      <rect
        x="21"
        y="3"
        width="6"
        height="42"
        rx="3"
        fill={C.red}
        style={mul}
      />
      <rect
        x="3"
        y="21"
        width="42"
        height="6"
        rx="3"
        fill={C.red}
        style={mul}
      />
    </Svg>
  ),
  qaqc: (p) => (
    <Svg {...p}>
      <path
        d="M24 4 40 10v12c0 11-7 18.5-16 22C15 40.5 8 33 8 22V10z"
        fill={C.indigo}
      />
      <path d="M24 4 40 10v12c0 11-7 18.5-16 22z" fill={C.blue} style={mul} />
      <path
        d="M16 24l6 6 11-12"
        stroke={W}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  certificates: (p) => (
    <Svg {...p}>
      <rect x="4" y="7" width="40" height="27" rx="4" fill={C.amber} />
      <rect x="9" y="13" width="17" height="3" rx="1.5" fill={W} opacity=".9" />
      <rect x="9" y="19" width="11" height="3" rx="1.5" fill={W} opacity=".9" />
      <path d="M29 30 26 45l7-3.5 7 3.5-3-15z" fill={C.red} />
      <circle cx="33" cy="27" r="7.5" fill={C.red} style={mul} />
    </Svg>
  ),
  production: (p) => (
    <Svg {...p}>
      <path d="M5 41V22l10-7v7l10-7v7l10-7v26z" fill={C.teal} />
      <rect
        x="33"
        y="7"
        width="9"
        height="34"
        rx="2"
        fill={C.orange}
        style={mul}
      />
      <rect x="10" y="30" width="5" height="5" rx="1" fill={W} />
      <rect x="20" y="30" width="5" height="5" rx="1" fill={W} />
    </Svg>
  ),
  invoices: (p) => (
    <Svg {...p}>
      <path d="M9 5h28v38l-4.7-3-4.6 3-4.7-3-4.7 3-4.6-3L9 43z" fill={C.teal} />
      <rect
        x="15"
        y="12"
        width="16"
        height="3"
        rx="1.5"
        fill={W}
        opacity=".85"
      />
      <rect
        x="15"
        y="18"
        width="11"
        height="3"
        rx="1.5"
        fill={W}
        opacity=".85"
      />
      <circle cx="34" cy="31" r="9.5" fill={C.amber} style={mul} />
    </Svg>
  ),
  payments: (p) => (
    <Svg {...p}>
      <rect x="4" y="10" width="40" height="28" rx="5" fill={C.violet} />
      <rect x="4" y="16" width="40" height="6" fill={C.ink} style={mul} />
      <rect x="9" y="28" width="11" height="4" rx="2" fill={W} opacity=".85" />
      <circle cx="35" cy="31" r="7.5" fill={C.amber} style={mul} />
    </Svg>
  ),
  customers: (p) => (
    <Svg {...p}>
      <circle cx="17" cy="15" r="7.5" fill={C.red} />
      <path d="M3 39c0-7.7 6.3-13 14-13s14 5.3 14 13z" fill={C.red} />
      <circle cx="31" cy="18" r="7.5" fill={C.sky} style={mul} />
      <path
        d="M17 42c0-7.7 6.3-13 14-13s14 5.3 14 13z"
        fill={C.sky}
        style={mul}
      />
    </Svg>
  ),
  activities: (p) => (
    <Svg {...p}>
      <rect x="6" y="7" width="36" height="34" rx="5" fill={C.green} />
      <rect
        x="6"
        y="24"
        width="36"
        height="17"
        rx="5"
        fill={C.teal}
        style={mul}
      />
      <path
        d="M12 16l3 3 5.5-6"
        stroke={W}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="24" y="14.5" width="12" height="3.5" rx="1.75" fill={W} />
      <path
        d="M12 32l3 3 5.5-6"
        stroke={W}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="24" y="30.5" width="12" height="3.5" rx="1.75" fill={W} />
    </Svg>
  ),
  templates: (p) => (
    <Svg {...p}>
      <rect x="14" y="4" width="25" height="31" rx="4" fill={C.sky} />
      <rect
        x="8"
        y="12"
        width="25"
        height="32"
        rx="4"
        fill={C.red}
        style={mul}
      />
      <rect
        x="13"
        y="20"
        width="15"
        height="3"
        rx="1.5"
        fill={W}
        opacity=".9"
      />
      <rect
        x="13"
        y="26"
        width="10"
        height="3"
        rx="1.5"
        fill={W}
        opacity=".9"
      />
    </Svg>
  ),
  resources: (p) => (
    <Svg {...p}>
      <rect
        x="20.5"
        y="2"
        width="7"
        height="44"
        rx="3.5"
        transform="rotate(45 24 24)"
        fill={C.sky}
      />
      <rect
        x="20.5"
        y="2"
        width="7"
        height="44"
        rx="3.5"
        transform="rotate(-45 24 24)"
        fill={C.red}
        style={mul}
      />
      <circle cx="10" cy="10" r="5" fill={C.amber} style={mul} />
    </Svg>
  ),
};

/** Renders one launcher icon by name (keys of ICONS, e.g. "enquiries"). */
export function AppIcon({ name, className }) {
  const Icon = ICONS[name];
  return Icon ? <Icon className={className} /> : null;
}
