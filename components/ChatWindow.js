/**
 * ChatWindow — renders the fan-assistant conversation transcript.
 * @param {Object} props
 * @param {import("../lib/types").ChatMessage[]} props.messages
 * @param {boolean} props.loading - whether an assistant reply is in flight
 */
export default function ChatWindow({ messages, loading }) {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Conversation with StadiumSense AI"
      className="stack"
      style={{
        gap: 14,
        minHeight: 280,
        maxHeight: 440,
        overflowY: "auto",
        padding: "4px 4px 8px",
      }}
    >
      {messages.length === 0 && (
        <div className="stack" style={{ gap: 10, padding: "18px 4px" }}>
          <p style={{ color: "var(--mist)", fontSize: "0.92rem", margin: 0 }}>
            Ask about gates, seats, crowd levels, getting there, or say
            &ldquo;I need help&rdquo; for an emergency. StadiumSense AI answers
            in your chosen language, grounded in live gate data.
          </p>
        </div>
      )}

      {messages.map((m, i) => (
        <div
          key={i}
          className="row fade-up"
          style={{
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            gap: 8,
          }}
        >
          {m.role !== "user" && (
            <span
              aria-hidden="true"
              className="row"
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "var(--pitch-green-deep)",
                border: "1px solid var(--turf-line)",
                justifyContent: "center",
                fontSize: "0.7rem",
                flexShrink: 0,
              }}
            >
              🏟️
            </span>
          )}
          <div
            style={{
              maxWidth: "82%",
              background: m.role === "user" ? "var(--scoreboard-amber)" : "rgba(46, 125, 82, 0.16)",
              color: m.role === "user" ? "var(--pitch-black)" : "var(--floodlight-white)",
              border: m.role === "user" ? "none" : "1px solid var(--turf-line)",
              borderRadius: "var(--radius-md)",
              borderBottomRightRadius: m.role === "user" ? 4 : "var(--radius-md)",
              borderBottomLeftRadius: m.role === "user" ? "var(--radius-md)" : 4,
              padding: "11px 15px",
              fontSize: "0.92rem",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {m.content}
          </div>
        </div>
      ))}

      {loading && (
        <div className="row" style={{ gap: 8 }}>
          <span
            aria-hidden="true"
            className="row"
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "var(--pitch-green-deep)",
              border: "1px solid var(--turf-line)",
              justifyContent: "center",
              fontSize: "0.7rem",
            }}
          >
            🏟️
          </span>
          <div className="row" style={{ gap: 4, padding: "11px 15px" }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden="true"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--turf-line-bright)",
                  animation: `typingDot 1.1s ${i * 0.15}s ease-in-out infinite`,
                  display: "inline-block",
                }}
              />
            ))}
          </div>
          <span className="sr-only">StadiumSense AI is typing a reply</span>
          <style jsx>{`
            @keyframes typingDot {
              0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
              30% { opacity: 1; transform: translateY(-3px); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
