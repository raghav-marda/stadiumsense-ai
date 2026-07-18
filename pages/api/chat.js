import { routeFanQuery } from "../../lib/orchestrator";

/** How many recent turns of chat history to send to the model per request. */
const MAX_HISTORY_TURNS = 10;

/**
 * POST /api/chat — the fan-facing assistant endpoint. Accepts the full
 * conversation so far plus the user's selected language, and returns the
 * next assistant reply (see lib/orchestrator.js for how the reply is
 * grounded in live stadium/tournament data).
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { messages, language } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "`messages` array is required." });
    }

    // Basic guardrail: cap history length sent to the model
    const trimmed = messages.slice(-MAX_HISTORY_TURNS);

    const reply = await routeFanQuery(trimmed, language || "English");
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("[/api/chat] error:", err.message);
    return res.status(500).json({
      error:
        "StadiumSense AI couldn't reach the language model. Check your API key in .env.local.",
      detail: err.message,
    });
  }
}
