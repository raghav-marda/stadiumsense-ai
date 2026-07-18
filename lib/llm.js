/**
 * lib/llm.js
 * -----------------------------------------------------------------------
 * A single, provider-agnostic entry point for calling a large language
 * model. The rest of the app never talks to a specific vendor directly —
 * everything goes through `callLLM()`, so swapping providers is a one-line
 * .env change (LLM_PROVIDER=anthropic | openai | gemini) and nothing else
 * in the codebase has to know or care.
 *
 * Gemini is included alongside Anthropic/OpenAI because Google AI Studio
 * issues API keys with no credit card and a generous free tier — useful
 * for anyone building this without a card on file.
 * -----------------------------------------------------------------------
 */

const PROVIDER = (process.env.LLM_PROVIDER || "gemini").toLowerCase();

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const GEMINI_URL_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * @param {Object} opts
 * @param {string} opts.system - system prompt / instructions
 * @param {Array<{role: "user"|"assistant", content: string}>} opts.messages
 * @param {number} [opts.maxTokens=1024]
 * @returns {Promise<string>} raw text reply from the model
 */
async function callLLM({ system, messages, maxTokens = 1024 }) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("callLLM: `messages` must be a non-empty array");
  }

  if (PROVIDER === "openai") {
    return callOpenAI({ system, messages, maxTokens });
  }
  if (PROVIDER === "gemini") {
    return callGemini({ system, messages, maxTokens });
  }
  // default / fallback provider
  return callAnthropic({ system, messages, maxTokens });
}

async function callAnthropic({ system, messages, maxTokens }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is missing. Add it to .env.local (see .env.example)."
    );
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await safeText(res);
    throw new Error(`Anthropic API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return (data.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

async function callOpenAI({ system, messages, maxTokens }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add it to .env.local (see .env.example)."
    );
  }

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_tokens: maxTokens,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });

  if (!res.ok) {
    const errText = await safeText(res);
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content || "").trim();
}

async function callGemini({ system, messages, maxTokens }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to .env.local (see .env.example)."
    );
  }

  // Google periodically retires specific model IDs, and its newest
  // "flagship" free-tier models (e.g. gemini-3.5-flash, aliased by
  // "gemini-flash-latest") often carry much stricter free daily quotas
  // than the lighter, slightly older Flash-Lite line. gemini-2.5-flash-lite
  // is tried first because it has the most generous free-tier quota
  // (roughly 1,000-1,500 requests/day vs. as few as 20/day on the newest
  // flagship), which matters a lot for a demo getting hit repeatedly
  // during judging. If a custom GEMINI_MODEL is set, or every candidate
  // 404s/hits quota, we fall through the rest of the list instead of
  // failing outright.
  const candidates = [
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-2.5-flash",
  ].filter(Boolean);

  // Gemini's REST API uses "user"/"model" roles and a `contents` array
  // instead of Anthropic/OpenAI's "assistant" role and `messages` array.
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  let lastError;

  for (const model of candidates) {
    const res = await fetch(
      `${GEMINI_URL_BASE}/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: system }] },
          generationConfig: { maxOutputTokens: maxTokens },
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      return parts
        .map((p) => p.text || "")
        .join("\n")
        .trim();
    }

    const errText = await safeText(res);
    lastError = `Gemini API error (${res.status}) for model "${model}": ${errText}`;

    // Fall through to the next candidate on:
    //  - 404: the model ID was retired / not found
    //  - 429: quota exhausted for THIS model specifically — each Gemini
    //    model has its own separate free-tier daily quota bucket, so a
    //    429 on one doesn't mean the next candidate is also exhausted.
    // Any other failure (bad key, malformed request, etc.) is the same
    // across every model, so fail fast instead of retrying pointlessly.
    if (res.status !== 404 && res.status !== 429) break;
  }

  throw new Error(lastError);
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "<no response body>";
  }
}

module.exports = { callLLM };
