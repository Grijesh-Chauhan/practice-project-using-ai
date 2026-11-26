import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import StopIcon from "@mui/icons-material/Stop";
import { useEffect, useRef } from "react";

import { useSpeechToText } from "../../hooks/useSpeechToText";
import type { User } from "../../types";
import { parseVoiceTicket, type ParsedVoiceTicket } from "../../utils/parseVoiceTicket";

interface VoiceTicketFillButtonProps {
  users: User[];
  disabled?: boolean;
  onParsed: (parsed: ParsedVoiceTicket) => void;
  onListeningChange?: (listening: boolean) => void;
  onInterimChange?: (interim: string) => void;
  onError?: (message: string | null) => void;
}

/**
 * Single mic control: listen to a full dictation, then parse into ticket fields.
 */
export function VoiceTicketFillButton({
  users,
  disabled = false,
  onParsed,
  onListeningChange,
  onInterimChange,
  onError,
}: VoiceTicketFillButtonProps) {
  const bufferRef = useRef("");
  const usersRef = useRef(users);
  const onParsedRef = useRef(onParsed);
  const wasListeningRef = useRef(false);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);
  useEffect(() => {
    onParsedRef.current = onParsed;
  }, [onParsed]);

  const { isSupported, isListening, errorMessage, interimTranscript, toggle, stop } =
    useSpeechToText({
      onFinalTranscript: (text) => {
        bufferRef.current = bufferRef.current
          ? `${bufferRef.current} ${text}`.trim()
          : text;
      },
    });

  useEffect(() => {
    onListeningChange?.(isListening);
  }, [isListening, onListeningChange]);

  useEffect(() => {
    onInterimChange?.(interimTranscript);
  }, [interimTranscript, onInterimChange]);

  useEffect(() => {
    onError?.(errorMessage);
  }, [errorMessage, onError]);

  // When listening stops, parse the accumulated transcript into form fields.
  useEffect(() => {
    if (wasListeningRef.current && !isListening) {
      const transcript = bufferRef.current.trim();
      bufferRef.current = "";
      if (transcript) {
        onParsedRef.current(parseVoiceTicket(transcript, usersRef.current));
      }
    }
    if (isListening && !wasListeningRef.current) {
      bufferRef.current = "";
    }
    wasListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  if (!isSupported) {
    return (
      <Tooltip title="Voice fill is not supported in this browser (try Chrome or Edge)">
        <span>
          <Button
            variant="outlined"
            startIcon={<MicOffIcon />}
            disabled
            aria-label="Voice fill unavailable"
          >
            Voice fill unavailable
          </Button>
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      title={
        isListening
          ? "Stop listening and fill the form"
          : "Speak the issue, priority, and assignee name"
      }
    >
      <Button
        type="button"
        variant={isListening ? "contained" : "outlined"}
        color={isListening ? "error" : "primary"}
        startIcon={isListening ? <StopIcon /> : <MicIcon />}
        onClick={toggle}
        disabled={disabled}
        aria-pressed={isListening}
        aria-label={isListening ? "Stop voice fill" : "Start voice fill"}
        sx={
          isListening
            ? {
                animation: "pulse 1.4s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%": { boxShadow: "0 0 0 0 rgba(211, 47, 47, 0.45)" },
                  "70%": { boxShadow: "0 0 0 10px rgba(211, 47, 47, 0)" },
                  "100%": { boxShadow: "0 0 0 0 rgba(211, 47, 47, 0)" },
                },
              }
            : undefined
        }
      >
        {isListening ? "Listening… tap to fill" : "Fill with voice"}
      </Button>
    </Tooltip>
  );
}
