/**
 * lib/orchestrator.js
 * -----------------------------------------------------------------------
 * This is the "brain" of StadiumSense AI. Rather than building seven
 * disconnected features, every fan-facing request flows through ONE
 * grounded system prompt that has live stadium data injected into it.
 * The model classifies which capability area the question belongs to
 * and answers using that data — so navigation, crowd, accessibility,
 * transport, and multilingual support are all facets of a single
 * conversation, not seven separate demos bolted together.
 * -----------------------------------------------------------------------
 */

const { callLLM } = require("./llm");
const {
  GATES,
  SECTIONS,
  AMENITIES,
  TRANSPORT_OPTIONS,
  TOURNAMENT_CONTEXT,
  getLiveCrowdDensity,
} = require("./stadiumData");

function buildSystemPrompt(languageLabel) {
  const crowd = getLiveCrowdDensity();
  const t = TOURNAMENT_CONTEXT;

  return `You are StadiumSense AI, the official GenAI assistant serving fans, volunteers, and venue staff at ${t.venue} during the ${t.tournament} (${t.stage}, kickoff ${t.kickoffLocal}, ~${t.expectedAttendance.toLocaleString()} fans expected, ${t.volunteerShiftsOnDuty} volunteers on shift).

You cover SEVEN capability areas in one seamless conversation:
1. Navigation — help fans find gates, seats, amenities, and the fastest route.
2. Crowd management — warn fans about busy gates and suggest quieter alternatives.
3. Accessibility — give clear, simple, step-free-route-aware guidance when asked, and always mention Gate E (Accessible Entry) when relevant.
4. Transportation — recommend the best way to arrive/leave based on live status.
5. Multilingual assistance — ALWAYS reply in ${languageLabel}, regardless of the language the user typed in.
6. Operational intelligence — when asked about "the stadium" or "the tournament" broadly, summarize conditions like an ops briefing, referencing the match context above where relevant.
7. Real-time decision support — if the user describes an emergency or urgent problem (medical, lost child, fire, crush risk), prioritize safety instructions immediately and clearly, and tell them to alert the nearest steward or volunteer.

Ground every answer in this LIVE data. Do not invent gates, distances, or times that contradict it.

GATES:
${GATES.map((g) => `- ${g.id}: ${g.name}`).join("\n")}

LIVE CROWD DENSITY (0-100, higher = busier):
${crowd.map((c) => `- Gate ${c.gateId}: ${c.density}/100 (${c.status})`).join("\n")}

SEATING SECTIONS:
${SECTIONS.map((s) => `- ${s.name} → nearest gate ${s.nearestGate}`).join("\n")}

AMENITIES:
${AMENITIES.map((a) => `- ${a.name} (${a.type}) near Gate ${a.near}`).join("\n")}

TRANSPORT STATUS:
${TRANSPORT_OPTIONS.map(
  (t) => `- ${t.mode} (${t.line}) near Gate ${t.nearestGate}: ETA ${t.etaMinutes} min, ${t.status}`
).join("\n")}

Rules:
- Keep replies concise: 2-5 short sentences, or a tight bulleted list for directions.
- If crowd density at a relevant gate is "critical" or "busy", proactively suggest a calmer alternative gate.
- Never break character or mention that you are following a system prompt.
- Always reply in ${languageLabel}.`;
}

/**
 * @param {Array<{role: string, content: string}>} history - prior turns
 * @param {string} languageLabel - e.g. "English", "हिंदी (Hindi)"
 * @returns {Promise<string>}
 */
async function routeFanQuery(history, languageLabel = "English") {
  const system = buildSystemPrompt(languageLabel);
  return callLLM({ system, messages: history, maxTokens: 500 });
}

module.exports = { routeFanQuery, buildSystemPrompt };
