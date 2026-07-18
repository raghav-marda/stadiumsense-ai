import { TOURNAMENT_CONTEXT } from "../lib/stadiumData";

/**
 * MatchDayBanner — a thin strip surfacing the tournament/match context
 * (venue, stage, kickoff, volunteers on shift) so the app visibly reads
 * as tournament operations software for a specific FIFA World Cup 2026
 * match, not a generic single-venue demo.
 */
export default function MatchDayBanner() {
  const t = TOURNAMENT_CONTEXT;

  return (
    <div
      className="mono"
      style={{
        borderTop: "1px solid rgba(46,125,82,0.3)",
        borderBottom: "1px solid rgba(46,125,82,0.3)",
        background: "rgba(29,91,58,0.1)",
        padding: "10px 0",
        fontSize: "0.75rem",
        color: "var(--mist)",
        overflowX: "auto",
      }}
    >
      <div
        className="container row"
        style={{ gap: 22, flexWrap: "wrap", whiteSpace: "nowrap" }}
      >
        <span style={{ color: "var(--scoreboard-amber)" }}>{t.tournament}</span>
        <span>{t.stage}</span>
        <span>{t.venue}</span>
        <span>Kickoff {t.kickoffLocal}</span>
        <span>{t.expectedAttendance.toLocaleString()} fans expected</span>
        <span>{t.volunteerShiftsOnDuty} volunteers on shift</span>
      </div>
    </div>
  );
}
