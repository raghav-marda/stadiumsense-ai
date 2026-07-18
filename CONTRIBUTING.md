# Contributing to StadiumSense AI

Thanks for your interest in improving StadiumSense AI. This document covers
the conventions the codebase follows so contributions stay consistent.

## Getting set up

```bash
npm install
cp .env.example .env.local   # add your GEMINI_API_KEY (no credit card required)
npm run dev
```

## Before opening a pull request

```bash
npm run lint     # ESLint (next/core-web-vitals ruleset)
npm run format   # Prettier — auto-formats the whole repo
npm test         # Jest — run the full unit test suite
```

## Code conventions

- **One capability, one module.** New AI capabilities belong in
  `lib/orchestrator.js`'s system prompt (fan-facing) or a new `pages/api/*`
  route (staff-facing) — not scattered across UI components.
- **Provider-agnostic AI calls.** Never call the Anthropic/OpenAI/Gemini
  REST APIs directly from a page or component — always go through
  `lib/llm.js`'s `callLLM()` so the provider stays swappable.
- **No secrets in code.** API keys are read from `process.env` only, inside
  server-side files (`lib/`, `pages/api/`). `.env` / `.env.local` are
  git-ignored — never commit real keys.
- **Shared error formatting.** Use `lib/formatApiError.js` when turning a
  failed `/api/*` response into a user-facing message, rather than
  re-implementing the "error + optional detail" logic inline.
- **Tests live next to what they cover.** Add a matching file under
  `__tests__/` for any new module in `lib/`.
- **Comment the "why," not the "what."** The codebase favors short
  docblocks explaining *why* a non-obvious decision was made (e.g. why a
  particular Gemini model is tried first) over restating what the code
  already says.

## Reporting issues

Open a GitHub issue with steps to reproduce, expected behavior, and actual
behavior. For AI-response issues, include the exact prompt/question asked.
