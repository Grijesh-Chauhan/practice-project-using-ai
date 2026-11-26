import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useSpeechToText } from "./useSpeechToText";

type RecognitionMock = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
};

let lastInstance: RecognitionMock;

function createRecognitionMock(): RecognitionMock {
  const instance: RecognitionMock = {
    continuous: false,
    interimResults: false,
    lang: "en-US",
    onresult: null,
    onerror: null,
    onend: null,
    start: vi.fn(),
    stop: vi.fn(() => {
      instance.onend?.();
    }),
    abort: vi.fn(),
  };
  lastInstance = instance;
  return instance;
}

describe("useSpeechToText", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "webkitSpeechRecognition",
      vi.fn(function MockSpeechRecognition() {
        return createRecognitionMock();
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts listening and reports final transcripts", () => {
    const onFinalTranscript = vi.fn();
    const { result } = renderHook(() => useSpeechToText({ onFinalTranscript }));

    expect(result.current.isSupported).toBe(true);

    act(() => {
      result.current.start();
    });

    expect(result.current.isListening).toBe(true);
    expect(lastInstance.start).toHaveBeenCalled();

    act(() => {
      lastInstance.onresult?.({
        resultIndex: 0,
        results: [
          {
            isFinal: true,
            0: { transcript: " Hello world " },
            length: 1,
          },
        ],
        length: 1,
      });
    });

    expect(onFinalTranscript).toHaveBeenCalledWith("Hello world");

    act(() => {
      result.current.stop();
    });
    expect(result.current.isListening).toBe(false);
  });

  it("reports not-allowed as a permission error", () => {
    const { result } = renderHook(() => useSpeechToText());

    act(() => {
      result.current.start();
    });

    act(() => {
      lastInstance.onerror?.({ error: "not-allowed", message: "" });
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toMatch(/permission was denied/i);
  });
});
