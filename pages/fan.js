import { useState, useCallback, useRef, useEffect } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import MatchDayBanner from "../components/MatchDayBanner";
import ChatWindow from "../components/ChatWindow";
import LanguageSelector from "../components/LanguageSelector";
import VoiceInput, { speak } from "../components/VoiceInput";
import StadiumMap from "../components/StadiumMap";
import { formatApiError } from "../lib/formatApiError";
import { getLiveCrowdDensity } from "../lib/stadiumData";

const SUGGESTIONS = [
  "Which gate is quietest right now?",
  "How do I get to Section S2?",
  "Best way to get here by transit?",
  "I need medical help near Gate B",
];

/**
 * /fan — the fan-facing assistant: chat, voice input/output, language
 * selection, and the live gate map, all backed by POST /api/chat.
 * @param {Object} props
 * @param {import("../lib/types").GateStatus[]} props.crowd - server-rendered
 *   initial crowd snapshot (see `getServerSideProps` below)
 */
export default function FanAssistant({ crowd }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text) => {
      const content = text.trim();
      if (!content || loading) return;

      setErrorBanner("");
      const nextMessages = [...messages, { role: "user", content }];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: nextMessages, language }),
        });
        const data = await res.json();

        if (!res.ok) {
          // Keep the user's message visible in the transcript; just surface
          // the error instead of a fabricated assistant reply.
          setErrorBanner(formatApiError(data, "Something went wrong reaching the assistant."));
          return;
        }

        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (voiceReplies) speak(data.reply);
      } catch {
        setErrorBanner("Network error — please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [messages, language, loading, voiceReplies]
  );

  return (
    <>
      <Head>
        <title>Fan Assistant — StadiumSense AI</title>
      </Head>

      <Navbar />
      <MatchDayBanner />

      <div
        className="container"
        style={{
          padding: "36px 24px 60px",
          filter: highContrast ? "contrast(1.35) brightness(1.08)" : "none",
        }}
      >
        <div className="row fade-up" style={{ justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p className="mono" style={{ color: "var(--turf-line-bright)", fontSize: "0.75rem", margin: "0 0 6px" }}>
              LIVE ASSISTANT
            </p>
            <h1 style={{ fontSize: "2.1rem" }}>Fan Assistant</h1>
          </div>

          <div className="row" style={{ gap: 18, alignItems: "flex-end", flexWrap: "wrap" }}>
            <LanguageSelector value={language} onChange={setLanguage} />
            <div className="stack" style={{ gap: 6 }}>
              <span className="field-label">Accessibility</span>
              <div className="row" style={{ gap: 10 }}>
                <button
                  type="button"
                  className={`btn secondary small${voiceReplies ? " toggle-active" : ""}`}
                  aria-pressed={voiceReplies}
                  onClick={() => setVoiceReplies((v) => !v)}
                >
                  {voiceReplies ? "🔊 Read aloud" : "🔈 Read aloud"}
                </button>
                <button
                  type="button"
                  className={`btn secondary small${highContrast ? " toggle-active" : ""}`}
                  aria-pressed={highContrast}
                  onClick={() => setHighContrast((v) => !v)}
                >
                  High contrast
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 28 }}>
          <div className="card">
            <ChatWindow messages={messages} loading={loading} />
            <div ref={chatEndRef} />

            {errorBanner && (
              <p
                role="alert"
                style={{
                  color: "var(--var-red)",
                  fontSize: "0.85rem",
                  margin: "6px 0 0",
                  padding: "8px 12px",
                  border: "1px solid var(--var-red)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--var-red-soft)",
                }}
              >
                {errorBanner}
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="row"
              style={{ gap: 10, marginTop: 14 }}
            >
              <label htmlFor="chat-input" className="sr-only">
                Ask StadiumSense AI a question
              </label>
              <input
                id="chat-input"
                className="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Which gate is quietest right now?"
                autoComplete="off"
              />
              <VoiceInput onResult={sendMessage} disabled={loading} />
              <button type="submit" className="btn" disabled={loading || !input.trim()}>
                Send
              </button>
            </form>

            <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="pill status-normal suggestion-pill"
                  onClick={() => sendMessage(suggestion)}
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <p className="mono" style={{ color: "var(--turf-line-bright)", marginBottom: 10, fontSize: "0.75rem" }}>
              LIVE GATE MAP
            </p>
            <StadiumMap crowd={crowd} />
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  return { props: { crowd: getLiveCrowdDensity() } };
}
