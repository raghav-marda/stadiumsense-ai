import { callLLM } from "../../lib/llm";
import { EMERGENCY_PROTOCOLS, AMENITIES, GATES } from "../../lib/stadiumData";

/**
 * POST /api/emergency — the real-time decision-support endpoint. Converts
 * a reported incident (medical, fire, overcrowding, lost person) plus its
 * nearest gate into an immediate, numbered action plan for stewards,
 * grounded in the actual nearest gate/medical-post data.
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { incidentType, location, details } = req.body || {};

    const protocol = EMERGENCY_PROTOCOLS[incidentType];
    if (!protocol) {
      return res.status(400).json({
        error: `Unknown incidentType. Expected one of: ${Object.keys(
          EMERGENCY_PROTOCOLS
        ).join(", ")}`,
      });
    }

    const nearestGate =
      GATES.find((g) => g.id === location) || GATES[0];
    const nearbyMedical = AMENITIES.find(
      (a) => a.type === "medical" && a.near === nearestGate.id
    );

    const system = `You are the real-time decision support module of StadiumSense AI for a FIFA World
Cup 2026 stadium. Staff have just reported an incident. Convert the standard protocol
and situational details into a short, calm, numbered action plan (max 5 steps) a
steward can follow immediately. Be specific about the gate/amenity names given.
No preamble.`;

    const userPrompt = `Incident type: ${protocol.label}
Location: near ${nearestGate.name}
Nearest medical post: ${nearbyMedical ? nearbyMedical.name : "none nearby — escalate to central control"}
Standard protocol steps: ${protocol.steps.join("; ")}
Additional details from reporter: ${details || "none provided"}

Produce the numbered action plan now.`;

    const actionPlan = await callLLM({
      system,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 350,
    });

    return res.status(200).json({
      incident: protocol.label,
      nearestGate: nearestGate.name,
      actionPlan,
    });
  } catch (err) {
    console.error("[/api/emergency] error:", err.message);
    return res.status(500).json({
      error: "Could not generate an action plan. Check your API key in .env.local.",
      detail: err.message,
    });
  }
}
