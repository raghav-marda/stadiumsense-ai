import { useEffect, useRef, useState, useCallback } from "react";

/**
 * VoiceInput — accessibility module.
 * Wraps the browser's Web Speech API so fans who can't type easily
 * (low vision, motor impairment, or busy hands in a crowd) can speak
 * their question and hear the reply read back.
 *
 * IMPORTANT: the SpeechRecognition instance is created exactly ONCE
 * (empty dependency array) and the latest `onResult` callback is read
 * through a ref. Wiring `onResult` directly into the effect's
 * dependency array would silently tear down and rebuild the
 * recognizer every time it changes elsewhere in the app — a subtle
 * bug that makes voice input flaky. This pattern avoids that.
 */
export default function VoiceInput({ onResult, disabled }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResultRef.current?.(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        // start() throws if called while already active — ignore.
      }
    }
  }, [listening]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      aria-pressed={listening}
      aria-label={listening ? "Stop voice input" : "Start voice input"}
      className={`btn secondary${listening ? " toggle-active" : ""}`}
    >
      {listening ? "● Listening…" : "🎤 Speak"}
    </button>
  );
}

/** Reads text aloud using SpeechSynthesis, if available in the browser. */
export function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}
