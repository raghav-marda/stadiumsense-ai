/**
 * These tests mock global.fetch so they run offline and don't burn real
 * API credits — they verify the provider-switching *logic* in lib/llm.js,
 * not the live model output.
 */

describe("lib/llm callLLM", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  test("throws a clear error when messages array is empty", async () => {
    const { callLLM } = require("../lib/llm");
    await expect(callLLM({ system: "s", messages: [] })).rejects.toThrow(
      /non-empty array/
    );
  });

  test("routes to the Anthropic endpoint by default", async () => {
    process.env.LLM_PROVIDER = "anthropic";
    process.env.ANTHROPIC_API_KEY = "test-key";

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [{ type: "text", text: "Gate A is quiet." }] }),
    });

    const { callLLM } = require("../lib/llm");
    const reply = await callLLM({
      system: "sys",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(reply).toBe("Gate A is quiet.");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({ method: "POST" })
    );
  });

  test("routes to the OpenAI endpoint when LLM_PROVIDER=openai", async () => {
    process.env.LLM_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = "test-key";

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Take Gate D." } }] }),
    });

    const { callLLM } = require("../lib/llm");
    const reply = await callLLM({
      system: "sys",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(reply).toBe("Take Gate D.");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({ method: "POST" })
    );
  });

  test("routes to the Gemini endpoint when LLM_PROVIDER=gemini (no card required)", async () => {
    process.env.LLM_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "test-key";

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "Gate D is calmest." }] } }],
      }),
    });

    const { callLLM } = require("../lib/llm");
    const reply = await callLLM({
      system: "sys",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(reply).toBe("Gate D is calmest.");
    const [calledUrl] = global.fetch.mock.calls[0];
    expect(calledUrl).toContain("generativelanguage.googleapis.com");
  });

  test("throws a helpful error when the API key is missing", async () => {
    process.env.LLM_PROVIDER = "anthropic";
    delete process.env.ANTHROPIC_API_KEY;

    const { callLLM } = require("../lib/llm");
    await expect(
      callLLM({ system: "s", messages: [{ role: "user", content: "hi" }] })
    ).rejects.toThrow(/ANTHROPIC_API_KEY is missing/);
  });

  test("surfaces upstream API errors with status code", async () => {
    process.env.LLM_PROVIDER = "anthropic";
    process.env.ANTHROPIC_API_KEY = "test-key";

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => "rate limited",
    });

    const { callLLM } = require("../lib/llm");
    await expect(
      callLLM({ system: "s", messages: [{ role: "user", content: "hi" }] })
    ).rejects.toThrow(/429/);
  });
});
