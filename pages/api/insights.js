import { callLLM } from "../../lib/llm";
import { getOrCompute } from "../../lib/cache";
import { getLiveCrowdDensity, TRANSPORT_OPTIONS, GATES } from "../../lib/stadiumData";

/**
 * GET /api/insights — the operational-intelligence endpoint. Turns live
 * gate/transport data into a short, control-room-style staffing briefing
 * for organizers and volunteers. Responses are cached per-minute (see
 * lib/cache.js) since the underlying crowd data only changes that often.
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  try {
    const crowd = getLiveCrowdDensity();
    const busyGates = crowd.filter((c) => c.status !== "normal");

    // Crowd data only changes once a minute (see getLiveCrowdDensity's
    // minute-seed), so the briefing for a given minute is deterministic
    // input — cache it instead of re-calling the LLM on every page load.
    const minuteKey = `insights:${Math.floor(Date.now() / 60000)}`;

    const { value: briefing, cached } = await getOrCompute(
      minuteKey,
      () => generateBriefing(crowd),
      60_000
    );

    return res.status(200).json({
      briefing,
      crowd,
      busyGateCount: busyGates.length,
      generatedAt: new Date().toISOString(),
      cached,
    });
  } catch (err) {
    console.error("[/api/insights] error:", err.message);
    return res.status(500).json({
      error: "Could not generate insights. Check your API key in .env.local.",
      detail: err.message,
    });
  }
}

async function generateBriefing(crowd) {
  const system = `You are the operational intelligence module of StadiumSense AI, writing a short
briefing for stadium staff and organizers ahead of a FIFA World Cup 2026 match.
Be direct and actionable, like a control-room briefing — not a chatbot.
Output 3-5 bullet points, each one concrete recommendation grounded in the data given.
No preamble, no sign-off, just the bullets.`;

  const userPrompt = `Current gate status:
${crowd.map((c) => `- Gate ${c.gateId} (${GATES.find((g) => g.id === c.gateId)?.name}): ${c.density}/100, ${c.status}`).join("\n")}

Transport status:
${TRANSPORT_OPTIONS.map((t) => `- ${t.mode} near Gate ${t.nearestGate}: ${t.status}, ETA ${t.etaMinutes} min`).join("\n")}

Write the staffing/operations briefing now.`;

  return callLLM({
    system,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 400,
  });
}
