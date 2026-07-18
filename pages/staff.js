import { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import MatchDayBanner from "../components/MatchDayBanner";
import StadiumMap from "../components/StadiumMap";
import { formatApiError } from "../lib/formatApiError";
import { GATES, getLiveCrowdDensity } from "../lib/stadiumData";

const INCIDENT_TYPES = [
  { value: "medical", label: "Medical Emergency" },
  { value: "overcrowding", label: "Overcrowding Risk" },
  { value: "fire", label: "Fire / Smoke Report" },
  { value: "lost_person", label: "Lost Person / Child" },
];

/**
 * /staff — the control-room dashboard: live crowd heatmap, an
 * AI-generated operational briefing (GET /api/insights), and the
 * real-time incident → action-plan tool (POST /api/emergency).
 * @param {Object} props
 * @param {import("../lib/types").GateStatus[]} props.crowd
 */
export default function StaffDashboard({ crowd }) {
  const [briefing, setBriefing] = useState("");
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [briefingError, setBriefingError] = useState("");

  const [incidentType, setIncidentType] = useState("medical");
  const [incidentGate, setIncidentGate] = useState(GATES[0].id);
  const [incidentDetails, setIncidentDetails] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/insights")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (ok) setBriefing(data.briefing);
        else setBriefingError(formatApiError(data, "Could not load briefing."));
      })
      .catch(() => !cancelled && setBriefingError("Network error loading briefing."))
      .finally(() => !cancelled && setBriefingLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const reportIncident = async (e) => {
    e.preventDefault();
    setPlanLoading(true);
    setPlanError("");
    setActionPlan("");
    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          incidentType,
          location: incidentGate,
          details: incidentDetails,
        }),
      });
      const data = await res.json();
      if (res.ok) setActionPlan(data.actionPlan);
      else setPlanError(formatApiError(data, "Could not generate action plan."));
    } catch {
      setPlanError("Network error generating action plan.");
    } finally {
      setPlanLoading(false);
    }
  };

  const { busyCount, criticalCount } = useMemo(() => {
    return {
      busyCount: crowd.filter((c) => c.status !== "normal").length,
      criticalCount: crowd.filter((c) => c.status === "critical").length,
    };
  }, [crowd]);

  return (
    <>
      <Head>
        <title>Staff Dashboard — StadiumSense AI</title>
      </Head>

      <Navbar />
      <MatchDayBanner />

      <div className="container" style={{ padding: "36px 24px 60px" }}>
        <div className="row fade-up" style={{ justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p className="mono" style={{ color: "var(--turf-line-bright)", fontSize: "0.75rem", margin: "0 0 6px" }}>
              CONTROL ROOM
            </p>
            <h1 style={{ fontSize: "2.1rem" }}>Operations Dashboard</h1>
          </div>
          <span className={`pill ${criticalCount > 0 ? "status-critical" : busyCount > 0 ? "status-busy" : "status-normal"}`}>
            {criticalCount > 0
              ? `${criticalCount} gate${criticalCount > 1 ? "s" : ""} critical`
              : busyCount > 0
              ? `${busyCount} gate${busyCount > 1 ? "s" : ""} busy`
              : "All gates normal"}
          </span>
        </div>

        <div className="grid-2" style={{ marginTop: 28 }}>
          <div className="card">
            <p className="mono" style={{ color: "var(--turf-line-bright)", marginBottom: 10, fontSize: "0.75rem" }}>
              LIVE CROWD HEATMAP
            </p>
            <StadiumMap crowd={crowd} />
          </div>

          <div className="card">
            <p className="mono" style={{ color: "var(--turf-line-bright)", marginBottom: 10, fontSize: "0.75rem" }}>
              AI OPERATIONAL BRIEFING
            </p>
            {briefingLoading && (
              <div className="stack" style={{ gap: 8 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 14, width: `${90 - i * 14}%` }} />
                ))}
              </div>
            )}
            {briefingError && <p style={{ color: "var(--var-red)" }}>{briefingError}</p>}
            {briefing && (
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.65, fontSize: "0.92rem" }}>{briefing}</div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: 24, borderColor: "rgba(233,72,60,0.35)" }}>
          <p className="mono" style={{ color: "var(--var-red)", marginBottom: 14, fontSize: "0.78rem" }}>
            ⚠ REAL-TIME DECISION SUPPORT — REPORT AN INCIDENT
          </p>

          <form onSubmit={reportIncident} className="stack" style={{ gap: 14, maxWidth: 560 }}>
            <label className="stack" style={{ gap: 6 }}>
              <span className="field-label">Incident type</span>
              <select
                className="select"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
              >
                {INCIDENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="stack" style={{ gap: 6 }}>
              <span className="field-label">Nearest gate</span>
              <select
                className="select"
                value={incidentGate}
                onChange={(e) => setIncidentGate(e.target.value)}
              >
                {GATES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="stack" style={{ gap: 6 }}>
              <span className="field-label">Details (optional)</span>
              <textarea
                className="textarea"
                value={incidentDetails}
                onChange={(e) => setIncidentDetails(e.target.value)}
                rows={3}
                style={{ resize: "vertical" }}
                placeholder="e.g. Fan collapsed near Section S1 entrance"
              />
            </label>

            <button type="submit" className="btn danger" disabled={planLoading} style={{ alignSelf: "flex-start" }}>
              {planLoading ? "Generating action plan…" : "Generate Action Plan"}
            </button>
          </form>

          {planError && (
            <p role="alert" style={{ color: "var(--var-red)", marginTop: 14 }}>
              {planError}
            </p>
          )}
          {actionPlan && (
            <div
              className="card fade-up"
              style={{ marginTop: 18, borderColor: "var(--var-red)", whiteSpace: "pre-wrap", fontSize: "0.92rem" }}
            >
              {actionPlan}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  return { props: { crowd: getLiveCrowdDensity() } };
}
