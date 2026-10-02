// Survey-map backdrop for the landing page: topographic contours (land/topo),
// a drone mapping flight pattern, a traverse with control points, bathymetric
// soundings (hydro), a coordinate grid, north arrow and scale bar.
// Everything is drawn once at module load; colours follow the theme via
// currentColor, and a radial fade keeps the centre clean behind the tiles.

import { useSyncExternalStore } from "react";

const r1 = (n) => Math.round(n * 10) / 10;

// Narrow screens show the left of the map (drone block, control points)
// instead of the mostly-empty centre.
const NARROW = "(max-width: 767px)";
const subscribe = (cb) => {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useNarrow = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(NARROW).matches,
    () => false,
  );

/** Closed, smooth (Catmull-Rom → cubic Bézier) path through points. */
function smoothClosed(pts) {
  const n = pts.length;
  const p = (i) => pts[(i + n) % n];
  let d = `M${r1(p(0)[0])} ${r1(p(0)[1])}`;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = p(i - 1);
    const [x1, y1] = p(i);
    const [x2, y2] = p(i + 1);
    const [x3, y3] = p(i + 2);
    d += `C${r1(x1 + (x2 - x0) / 6)} ${r1(y1 + (y2 - y0) / 6)} ${r1(x2 - (x3 - x1) / 6)} ${r1(y2 - (y3 - y1) / 6)} ${r1(x2)} ${r1(y2)}`;
  }
  return `${d}Z`;
}

/** One contour ring of an irregular hill. Same shape per hill so rings never cross. */
function contour(cx, cy, r, seed, level) {
  const pts = [];
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * Math.PI * 2;
    const k =
      1 +
      0.17 * Math.sin(2 * t + seed) +
      0.09 * Math.sin(3 * t + seed * 1.7) +
      0.05 * Math.sin(5 * t + seed * 2.3);
    pts.push([
      cx - level * 3 + Math.cos(t) * r * k * 1.3,
      cy + level * 2 + Math.sin(t) * r * k * 0.82,
    ]);
  }
  return { d: smoothClosed(pts), label: pts[0] };
}

function hill({ cx, cy, rings, start, step, seed, base, interval }) {
  return Array.from({ length: rings }, (_, i) => {
    const level = rings - 1 - i; // outer ring = lowest elevation
    const { d, label } = contour(
      cx,
      cy,
      start + step * (rings - 1 - i),
      seed,
      i,
    );
    return {
      d,
      label,
      index: level % 5 === 0,
      elevation: base + level * interval,
    };
  });
}

const HILLS = [
  ...hill({
    cx: 1290,
    cy: 240,
    rings: 11,
    start: 34,
    step: 27,
    seed: 0.7,
    base: 120,
    interval: 5,
  }),
  ...hill({
    cx: 220,
    cy: 820,
    rings: 9,
    start: 28,
    step: 26,
    seed: 2.1,
    base: 40,
    interval: 5,
  }),
];

function wave(y0, amp, freq, phase) {
  let d = "";
  for (let x = 1250; x <= 1640; x += 16) {
    const y =
      y0 +
      amp * Math.sin(x * freq + phase) +
      amp * 0.45 * Math.sin(x * freq * 2.3 + phase * 1.3);
    d += `${x === 1250 ? "M" : "L"}${x} ${r1(y)}`;
  }
  return d;
}
const BATHY = [
  wave(760, 8, 0.016, 0.4),
  wave(792, 9, 0.017, 1.1),
  wave(824, 10, 0.015, 1.9),
  wave(856, 11, 0.016, 2.6),
  wave(888, 12, 0.017, 3.3),
  wave(920, 12, 0.015, 4.0),
  wave(952, 13, 0.016, 4.7),
];
const SOUNDINGS = [
  [1290, 779, "2.4"],
  [1420, 772, "2.9"],
  [1550, 784, "3.1"],
  [1340, 841, "4.6"],
  [1470, 838, "5.2"],
  [1290, 905, "6.8"],
  [1420, 906, "7.4"],
  [1550, 900, "8.1"],
  [1350, 968, "9.6"],
  [1490, 972, "10.3"],
];

// Drone photogrammetry: back-and-forth ("lawnmower") flight lines over a block.
const FLIGHT = (() => {
  const x0 = 64,
    x1 = 292,
    y0 = 150,
    step = 34,
    passes = 7,
    r = step / 2;
  let d = `M${x0} ${y0}`;
  const shots = [];
  for (let i = 0; i < passes; i++) {
    const y = y0 + i * step;
    const toRight = i % 2 === 0;
    const [from, to] = toRight ? [x0, x1] : [x1, x0];
    d += ` L${to} ${y}`;
    for (let x = Math.min(from, to) + 22; x < Math.max(from, to); x += 44)
      shots.push([x, y]);
    if (i < passes - 1)
      d += ` A${r} ${r} 0 0 ${toRight ? 1 : 0} ${to} ${y + step}`;
  }
  return {
    d,
    shots,
    box: {
      x: x0 - 30,
      y: y0 - 26,
      w: x1 - x0 + 60,
      h: step * (passes - 1) + 52,
    },
  };
})();

const TRAVERSE = [
  [60, 520, "CP-01"],
  [205, 600, "CP-02"],
  [330, 528, "CP-03"],
  [300, 408, "CP-04"],
];

function ControlPoint({ x, y, label }) {
  return (
    <g className="text-signal-100">
      <path
        d={`M${x} ${y - 7}L${x + 6.5} ${y + 4.5}H${x - 6.5}Z`}
        fill="currentColor"
        opacity=".35"
      />
      <circle cx={x} cy={y} r="1.6" fill="currentColor" />
      <text
        x={x + 10}
        y={y - 6}
        className="fill-current font-mono"
        fontSize="10"
        opacity=".7"
      >
        {label}
      </text>
    </g>
  );
}

export function SurveyBackdrop() {
  const narrow = useNarrow();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio={narrow ? "xMinYMid slice" : "xMidYMid slice"}
        className="h-full w-full text-ink-100 dark:text-ink-700"
      >
        <defs>
          <pattern
            id="fse-grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M80 0H0V80"
              fill="none"
              stroke="currentColor"
              strokeWidth=".5"
              opacity=".35"
            />
            <path
              d="M0 -5V5M-5 0H5"
              stroke="currentColor"
              strokeWidth="1"
              opacity=".9"
            />
          </pattern>
        </defs>

        {/* coordinate grid + edge labels */}
        <rect width="1600" height="1000" fill="url(#fse-grid)" />
        <g className="fill-current font-mono" fontSize="10" opacity=".8">
          {["25°13′N", "25°12′N", "25°11′N"].map((t, i) => (
            <text key={t} x="48" y={236 + i * 240}>
              {t}
            </text>
          ))}
          {["55°15′E", "55°16′E"].map((t, i) => (
            <text key={t} x={406 + i * 480} y="992">
              {t}
            </text>
          ))}
        </g>

        {/* topographic contours (land / topo) */}
        <g fill="none" stroke="currentColor">
          {HILLS.map((c, i) => (
            <path
              key={i}
              d={c.d}
              strokeWidth={c.index ? 1.4 : 0.8}
              opacity={c.index ? 0.95 : 0.7}
            />
          ))}
        </g>
        <g className="fill-current font-mono" fontSize="10">
          {HILLS.filter((c) => c.index).map((c, i) => (
            <text key={i} x={c.label[0] + 4} y={c.label[1] - 3}>
              {c.elevation}
            </text>
          ))}
        </g>

        {/* drone mapping flight (UAV photogrammetry) */}
        <g className="text-signal-200">
          <rect
            x={FLIGHT.box.x}
            y={FLIGHT.box.y}
            width={FLIGHT.box.w}
            height={FLIGHT.box.h}
            rx="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 5"
            opacity=".35"
          />
          <path
            d={FLIGHT.d}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="7 6"
            opacity=".45"
            className="animate-survey-dash"
          />
          {FLIGHT.shots.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.8"
              fill="currentColor"
              opacity=".45"
            />
          ))}
          <g
            transform={`translate(${FLIGHT.box.x + FLIGHT.box.w - 12} ${FLIGHT.box.y - 2})`}
            opacity=".7"
          >
            <path
              d="M-7 -7 7 7M7 -7-7 7"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <rect
              x="-3"
              y="-3"
              width="6"
              height="6"
              rx="1.2"
              fill="currentColor"
            />
            {[
              [-7, -7],
              [7, -7],
              [-7, 7],
              [7, 7],
            ].map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            ))}
          </g>
          <text
            x={FLIGHT.box.x}
            y={FLIGHT.box.y - 8}
            className="fill-current font-mono"
            fontSize="10"
            opacity=".6"
          >
            UAV BLOCK A · GSD 2.5cm
          </text>
        </g>

        {/* traverse with control points (land survey) */}
        <polyline
          points={TRAVERSE.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          className="stroke-signal-500"
          strokeWidth="1"
          strokeDasharray="10 4 2 4"
          opacity=".45"
        />
        {TRAVERSE.map(([x, y, label]) => (
          <ControlPoint key={label} x={x} y={y} label={label} />
        ))}
        <ControlPoint x={1290 - 30} y={258} label="BM 172.40" />

        {/* bathymetry (hydro) */}
        <g className="text-sky-100 dark:text-sky-800">
          {BATHY.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity={0.55 + i * 0.08}
            />
          ))}
          <g className="fill-current font-mono" fontSize="10" opacity=".9">
            {SOUNDINGS.map(([x, y, t]) => (
              <text key={`${x}-${y}`} x={x} y={y}>
                {t}
              </text>
            ))}
          </g>
        </g>

        {/* north arrow */}
        <g
          transform="translate(1548 112)"
          className="text-ink-200 dark:text-ink-600"
        >
          <circle
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity=".6"
          />
          <path d="M0 -15 6 6 0 2-6 6Z" fill="currentColor" />
          <text
            y="-22"
            textAnchor="middle"
            className="fill-current font-mono"
            fontSize="11"
            fontWeight="600"
          >
            N
          </text>
        </g>

        {/* scale bar */}
        <g
          transform="translate(40 936)"
          className="text-ink-200 max-md:hidden dark:text-ink-600"
        >
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 30}
              y="0"
              width="30"
              height="5"
              fill={i % 2 ? "none" : "currentColor"}
              stroke="currentColor"
              strokeWidth=".8"
            />
          ))}
          <g className="fill-current font-mono" fontSize="9">
            <text x="0" y="-4" textAnchor="middle">
              0
            </text>
            <text x="60" y="-4" textAnchor="middle">
              50
            </text>
            <text x="120" y="-4" textAnchor="middle">
              100 m
            </text>
          </g>
        </g>
      </svg>

      {/* keep the middle calm so the tiles stay readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_44%_56%_at_50%_54%,rgba(250,250,249,0.96)_0%,rgba(250,250,249,0.82)_55%,rgba(250,250,249,0)_100%)] dark:bg-[radial-gradient(ellipse_44%_56%_at_50%_54%,rgba(10,10,10,0.95)_0%,rgba(10,10,10,0.8)_55%,rgba(10,10,10,0)_100%)]" />
    </div>
  );
}
