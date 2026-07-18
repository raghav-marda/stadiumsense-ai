import { useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import Navbar from "../components/Navbar";
import MatchDayBanner from "../components/MatchDayBanner";
import StadiumMap from "../components/StadiumMap";
import { getLiveCrowdDensity, GATES } from "../lib/stadiumData";

const CAPABILITIES = [
  { n: "01", label: "Navigation", detail: "Turn-by-turn to your seat, gate, or nearest amenity — grounded in live stadium data, not guesswork." },
  { n: "02", label: "Crowd Management", detail: "Live gate density simulation with proactive, calmer-route suggestions before a queue forms." },
  { n: "03", label: "Accessibility", detail: "Voice input/output, high-contrast mode, and step-free routing via the Accessible Entry." },
  { n: "04", label: "Transportation", detail: "Metro, shuttle, ride-share & parking status, compared live so fans pick the fastest way in." },
  { n: "05", label: "Multilingual", detail: "One assistant, six languages — no separate app, no switching context." },
  { n: "06", label: "Operational Intelligence", detail: "AI-generated staffing briefings that turn raw sensor data into control-room decisions." },
  { n: "07", label: "Real-Time Decision Support", detail: "Instant, numbered action plans the moment a steward reports an incident." },
];

/**
 * / — landing page: hero, live stats derived from `crowd`, the live gate
 * map, and the seven-capability-area breakdown.
 * @param {Object} props
 * @param {import("../lib/types").GateStatus[]} props.crowd
 */
export default function Home({ crowd }) {
  // Small, fixed-size array (one entry per gate) — the computation itself
  // is trivial, but memoizing avoids re-deriving it on unrelated re-renders
  // (e.g. a future client-side state change) instead of only on mount.
  const { busy, avgDensity } = useMemo(() => {
    const busyCount = crowd.filter((c) => c.status !== "normal").length;
    const avg = Math.round(crowd.reduce((s, c) => s + c.density, 0) / crowd.length);
    return { busy: busyCount, avgDensity: avg };
  }, [crowd]);

  return (
    <>
      <Head>
        <title>StadiumSense AI — FIFA World Cup 2026</title>
        <meta
          name="description"
          content="A GenAI-powered companion for stadium navigation, crowd management, accessibility, transport, and real-time operations at FIFA World Cup 2026."
        />
        <meta property="og:title" content="StadiumSense AI" />
        <meta
          property="og:description"
          content="One AI companion for fans and stadium staff at FIFA World Cup 2026."
        />
      </Head>

      <Navbar />
      <MatchDayBanner />

      <section style={{ padding: "76px 0 40px" }}>
        <div className="container stack" style={{ gap: 18 }}>
          <p
            className="mono fade-up"
            style={{ color: "var(--scoreboard-amber)", letterSpacing: "0.16em", margin: 0, fontSize: "0.78rem" }}
          >
            PROMPTWARS · CHALLENGE 04 · SMART STADIUMS &amp; TOURNAMENT OPERATIONS
          </p>
          <h1
            className="fade-up"
            style={{ fontSize: "clamp(2.4rem, 6.4vw, 4.6rem)", lineHeight: 1.03, maxWidth: 860, animationDelay: "0.06s" }}
          >
            One AI. Every gate.
            <br />
            Every fan. Every steward.
          </h1>
          <p
            className="fade-up"
            style={{ maxWidth: 580, color: "var(--mist)", fontSize: "1.06rem", animationDelay: "0.12s" }}
          >
            StadiumSense AI is a single GenAI companion that guides fans in and
            out safely, keeps organizers and volunteers ahead of crowd surges, and
            gives stewards a real-time playbook — built for FIFA World Cup 2026.
          </p>
          <div className="row fade-up" style={{ gap: 14, marginTop: 8, flexWrap: "wrap", animationDelay: "0.18s" }}>
            <Link href="/fan" className="btn">
              Open Fan Assistant →
            </Link>
            <Link href="/staff" className="btn secondary">
              Open Staff Dashboard
            </Link>
          </div>

          <div
            className="row fade-up"
            style={{ gap: 28, marginTop: 30, flexWrap: "wrap", animationDelay: "0.24s" }}
          >
            <Stat label="Gates monitored" value={GATES.length} />
            <Stat label="Avg. gate load" value={`${avgDensity}%`} />
            <Stat label="Gates needing attention" value={busy} accent={busy > 0} />
            <Stat label="Languages supported" value="6" />
          </div>
        </div>
      </section>

      <section style={{ padding: "10px 0 60px" }}>
        <div className="container">
          <div className="card glow grid-2" style={{ alignItems: "center" }}>
            <div>
              <p className="mono" style={{ color: "var(--turf-line-bright)", marginBottom: 10, fontSize: "0.75rem" }}>
                LIVE GATE STATUS (SIMULATED)
              </p>
              <StadiumMap crowd={crowd} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 16 }}>Seven areas. One brain.</h2>
              <ul className="stack stagger" style={{ listStyle: "none", padding: 0, margin: 0, gap: 16 }}>
                {CAPABILITIES.map((c) => (
                  <li key={c.label} className="row" style={{ gap: 14, alignItems: "flex-start" }}>
                    <span className="mono" style={{ color: "var(--scoreboard-amber)", fontSize: "0.85rem", paddingTop: 2 }}>
                      {c.n}
                    </span>
                    <div>
                      <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", letterSpacing: "0.01em" }}>
                        {c.label}
                      </strong>
                      <p style={{ margin: "3px 0 0", color: "var(--mist)", fontSize: "0.87rem", lineHeight: 1.5 }}>
                        {c.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ padding: "24px 0 60px", borderTop: "1px solid rgba(46,125,82,0.25)" }}>
        <div className="container row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <p className="mono" style={{ color: "var(--mist)", fontSize: "0.75rem", margin: 0 }}>
            Built for Hack2Skill PromptWars · Virtual · Challenge 4
          </p>
          <p className="mono" style={{ color: "var(--mist-dim)", fontSize: "0.72rem", margin: 0 }}>
            Mock stadium data · GenAI-orchestrated
          </p>
        </div>
      </footer>
    </>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="stack" style={{ gap: 2 }}>
      <span
        className="mono"
        style={{
          fontSize: "1.7rem",
          fontWeight: 600,
          color: accent ? "var(--scoreboard-amber)" : "var(--floodlight-white)",
        }}
      >
        {value}
      </span>
      <span className="mono" style={{ fontSize: "0.68rem", color: "var(--mist)", letterSpacing: "0.04em" }}>
        {label.toUpperCase()}
      </span>
    </div>
  );
}

export async function getServerSideProps() {
  return { props: { crowd: getLiveCrowdDensity() } };
}
