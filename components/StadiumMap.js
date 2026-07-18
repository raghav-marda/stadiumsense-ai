import { useId, useMemo, memo } from "react";
import { GATES } from "../lib/stadiumData";

const STATUS_COLOR = {
  normal: "#3fae72",
  busy: "#ffb020",
  critical: "#e9483c",
};

const STATUS_LABEL = {
  normal: "Normal flow",
  busy: "Busy",
  critical: "Critical — reroute advised",
};

/**
 * StadiumMap — the signature visual of StadiumSense AI.
 * Renders the stadium bowl as an SVG with gates positioned around it.
 * Each gate pulses with a ring sized by live crowd density, doubling as
 * both a navigation aid (fan view) and a live heatmap (staff view).
 * Includes a legend and native <title> tooltips for accessibility.
 *
 * @param {Array} crowd - [{ gateId, density, status }]
 * @param {string} [highlightGate] - gate id to highlight as "your route"
 * @param {boolean} [showLegend] - render the status legend beneath the map
 */
function StadiumMap({ crowd = [], highlightGate, showLegend = true }) {
  const gradientId = useId();

  // Build the lookup once (O(n)) instead of calling Array.find for every
  // gate inside the render loop below (which would be O(gates × crowd)).
  // Trivial at today's 5-gate scale, but keeps the pattern correct if the
  // digital twin ever scales to a multi-stadium tournament deployment.
  const crowdByGate = useMemo(() => {
    const map = new Map();
    crowd.forEach((c) => map.set(c.gateId, c));
    return map;
  }, [crowd]);

  const densityFor = (gateId) =>
    crowdByGate.get(gateId) || { density: 30, status: "normal" };

  return (
    <div>
      <svg
        viewBox="0 0 800 460"
        role="img"
        aria-label="Live stadium map showing gate crowd levels"
        style={{ width: "100%", height: "auto" }}
      >
        <defs>
          <radialGradient id={`${gradientId}-pitch`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1d5b3a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0b0f0c" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer bowl */}
        <ellipse cx="400" cy="230" rx="235" ry="155" fill="none" stroke="#2e7d52" strokeWidth="1.5" opacity="0.4" />
        <ellipse cx="400" cy="230" rx="200" ry="128" fill="none" stroke="#2e7d52" strokeWidth="1" opacity="0.22" strokeDasharray="2 6" />

        {/* Pitch */}
        <ellipse cx="400" cy="230" rx="150" ry="86" fill={`url(#${gradientId}-pitch)`} />
        <ellipse cx="400" cy="230" rx="150" ry="86" fill="none" stroke="#3fae72" strokeWidth="1.5" opacity="0.5" />
        <line x1="400" y1="144" x2="400" y2="316" stroke="#3fae72" strokeWidth="1" opacity="0.35" />
        <circle cx="400" cy="230" r="26" fill="none" stroke="#3fae72" strokeWidth="1" opacity="0.35" />
        <text
          x="400"
          y="236"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="16"
          fill="#9fb3a8"
          letterSpacing="3"
        >
          PITCH
        </text>

        {GATES.map((gate) => {
          const d = densityFor(gate.id);
          const color = STATUS_COLOR[d.status] || STATUS_COLOR.normal;
          const ringR = 16 + (d.density / 100) * 24;
          const isHighlighted = highlightGate === gate.id;
          const labelBelow = gate.y >= 230;

          return (
            <g key={gate.id} style={{ cursor: "default" }}>
              <title>
                {gate.name} — {d.density}% capacity ({STATUS_LABEL[d.status]})
              </title>

              <circle cx={gate.x} cy={gate.y} r={ringR} fill={color} opacity="0.16">
                <animate
                  attributeName="r"
                  values={`${ringR};${ringR + 7};${ringR}`}
                  dur="2.6s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.16;0.05;0.16"
                  dur="2.6s"
                  repeatCount="indefinite"
                />
              </circle>

              {isHighlighted && (
                <circle cx={gate.x} cy={gate.y} r={ringR + 12} fill="none" stroke="#ffb020" strokeWidth="2" strokeDasharray="3 5">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from={`0 ${gate.x} ${gate.y}`}
                    to={`360 ${gate.x} ${gate.y}`}
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              <circle
                cx={gate.x}
                cy={gate.y}
                r="15"
                fill={isHighlighted ? "#ffb020" : "#0b0f0c"}
                stroke={color}
                strokeWidth="3"
              />
              <text
                x={gate.x}
                y={gate.y + 5}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="13"
                fontWeight="600"
                fill={isHighlighted ? "#0b0f0c" : "#f5f7f2"}
              >
                {gate.id}
              </text>
              <text
                x={gate.x}
                y={gate.y + (labelBelow ? 38 : -24)}
                textAnchor="middle"
                fontFamily="var(--font-body)"
                fontSize="11"
                fill={color}
                fontWeight="600"
              >
                {d.density}%
              </text>
            </g>
          );
        })}
      </svg>

      {showLegend && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
          {Object.entries(STATUS_LABEL).map(([status, label]) => (
            <span key={status} className="row" style={{ gap: 6, fontSize: "0.75rem", color: "var(--mist)" }}>
              <span
                aria-hidden="true"
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: STATUS_COLOR[status],
                  display: "inline-block",
                }}
              />
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// The stadium SVG is the most visually complex, most-rendered component in
// the app (landing page, fan view, and staff heatmap all mount it). It only
// needs to re-render when `crowd` or `highlightGate` actually change, not
// on every keystroke in a sibling chat input — memoizing it measurably cuts
// wasted render work during a chat session.
export default memo(StadiumMap);
