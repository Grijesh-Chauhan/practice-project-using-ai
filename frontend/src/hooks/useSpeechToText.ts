import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechToTextStatus = "unsupported" | "idle" | "listening" | "error";

export interface UseSpeechToTextOptions {
  lang?: string;
  /** Called with each finalized phrase (not interim). */
  onFinalTranscript?: (transcript: string) => void;
  /** Called with the latest interim (in-progress) transcript. */
  onInterimTranscript?: (transcript: string) => void;
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

/**
 * Browser speech-to-text (Web Speech API) for voice typing into form fields.
 * Chrome/Edge support is best; Safari may use webkit prefix; Firefox often unsupported.
 */
export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { lang = "en-US", onFinalTranscript, onInterimTranscript } = options;
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [status, setStatus] = useState<SpeechToTextStatus>(() =>
    isSpeechRecognitionSupported() ? "idle" : "unsupported",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");

  const onFinalRef = useRef(onFinalTranscript);
  const onInterimRef = useRef(onInterimTranscript);
  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  }, [onFinalTranscript]);
  useEffect(() => {
    onInterimRef.current = onInterimTranscript;
  }, [onInterimTranscript]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) {
      setStatus("unsupported");
      setErrorMessage("Voice typing is not supported in this browser.");
      return;
    }

    recognitionRef.current?.abort();

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript?.trim() ?? "";
        if (!text) {
          continue;
        }
        if (result.isFinal) {
          onFinalRef.current?.(text);
        } else {
          interim += `${text} `;
        }
      }
      const cleaned = interim.trim();
      setInterimTranscript(cleaned);
      onInterimRef.current?.(cleaned);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") {
        return;
      }
      setStatus("error");
      setErrorMessage(
        event.error === "not-allowed"
          ? "Microphone permission was denied."
          : `Voice typing error: ${event.error}`,
      );
    };

    recognition.onend = () => {
      setInterimTranscript("");
      setStatus((current) => (current === "unsupported" ? current : "idle"));
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setErrorMessage(null);
      setStatus("listening");
    } catch {
      setStatus("error");
      setErrorMessage("Could not start voice typing. Try again.");
    }
  }, [lang]);

  const toggle = useCallback(() => {
    if (status === "listening") {
      stop();
      return;
    }
    start();
  }, [start, status, stop]);

  return {
    status,
    errorMessage,
    interimTranscript,
    isSupported: status !== "unsupported",
    isListening: status === "listening",
    start,
    stop,
    toggle,
  };
}
