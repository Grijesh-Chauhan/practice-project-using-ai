import type { Priority, User } from "../types";

export interface ParsedVoiceTicket {
  title: string;
  description: string;
  priority: Priority;
  assigned_to: number | null;
  /** Display name when an assignee was matched. */
  matchedAssigneeName: string | null;
  /** Whether priority was explicitly mentioned. */
  priorityDetected: boolean;
  /** Human-readable parse notes for the UI. */
  notes: string[];
}

const PRIORITY_ALIASES: Record<string, Priority> = {
  low: "low",
  medium: "medium",
  med: "medium",
  normal: "medium",
  high: "high",
  urgent: "high",
  critical: "high",
};

const BOILERPLATE_PREFIX =
  /^(?:please\s+)?(?:create|open|file|raise|log|make|start)\s+(?:a\s+|an\s+|the\s+)?(?:new\s+)?(?:support\s+)?ticket(?:\s+(?:for|about|regarding))?\s*[,.:-]?\s*/i;

const PRIORITY_PATTERNS: RegExp[] = [
  /\bpriority\s*(?:is|:)?\s*(low|medium|med|normal|high|urgent|critical)\b/gi,
  /\b(low|medium|med|normal|high|urgent|critical)\s+priority\b/gi,
  /\b(?:set\s+)?priority\s+to\s+(low|medium|med|normal|high|urgent|critical)\b/gi,
];

const ASSIGNEE_LEADINS =
  /\b(?:assign(?:ed)?(?:\s+it)?\s+to|assignee(?:\s+is)?|give(?:\s+it)?\s+to|hand(?:\s+it)?\s+(?:off\s+)?to|for\s+agent)\s+/gi;

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractPriority(transcript: string): {
  priority: Priority;
  detected: boolean;
  cleaned: string;
} {
  let cleaned = transcript;
  let detected: Priority | null = null;

  for (const pattern of PRIORITY_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(transcript);
    if (!match) {
      continue;
    }
    const raw = match[1]?.toLowerCase() ?? "";
    const mapped = PRIORITY_ALIASES[raw];
    if (mapped) {
      detected = mapped;
      cleaned = cleaned.replace(match[0], " ");
      break;
    }
  }

  return {
    priority: detected ?? "medium",
    detected: detected !== null,
    cleaned: normalizeWhitespace(cleaned),
  };
}

function scoreNameMatch(spoken: string, userName: string): number {
  const spokenNorm = spoken.toLowerCase().trim();
  const full = userName.toLowerCase().trim();
  if (!spokenNorm || !full) {
    return 0;
  }
  if (full === spokenNorm) {
    return 100;
  }
  if (full.startsWith(spokenNorm) || spokenNorm.startsWith(full)) {
    return 90;
  }
  const parts = full.split(/\s+/);
  if (parts.some((part) => part === spokenNorm)) {
    return 80;
  }
  if (parts.some((part) => part.startsWith(spokenNorm) && spokenNorm.length >= 3)) {
    return 60;
  }
  return 0;
}

function extractAssignee(
  transcript: string,
  users: User[],
): {
  assigned_to: number | null;
  matchedAssigneeName: string | null;
  cleaned: string;
} {
  if (users.length === 0) {
    return { assigned_to: null, matchedAssigneeName: null, cleaned: transcript };
  }

  let cleaned = transcript;
  let best: { user: User; score: number; matchedText: string } | null = null;

  // Explicit "assign to …" style phrases: capture following 1–3 words.
  const explicit = new RegExp(
    `${ASSIGNEE_LEADINS.source}([a-zA-Z][a-zA-Z.'-]{0,40}(?:\\s+[a-zA-Z][a-zA-Z.'-]{0,40}){0,2})`,
    "gi",
  );

  let match: RegExpExecArray | null;
  while ((match = explicit.exec(transcript)) !== null) {
    const spoken = match[1]?.trim() ?? "";
    for (const user of users) {
      const score = scoreNameMatch(spoken, user.name);
      if (score > 0 && (!best || score > best.score)) {
        best = { user, score, matchedText: match[0] };
      }
      // Also try first token only ("Alice" from "Alice please")
      const first = spoken.split(/\s+/)[0] ?? "";
      const firstScore = scoreNameMatch(first, user.name);
      if (firstScore > 0 && (!best || firstScore > best.score)) {
        best = { user, score: firstScore, matchedText: match[0] };
      }
    }
  }

  // Fallback: scan for any user name (full or first) mentioned in the transcript.
  if (!best) {
    for (const user of users) {
      const full = user.name;
      const first = full.split(/\s+/)[0] ?? full;
      for (const candidate of [full, first]) {
        if (candidate.length < 3) {
          continue;
        }
        const re = new RegExp(`\\b${escapeRegExp(candidate)}\\b`, "i");
        const found = transcript.match(re);
        if (!found) {
          continue;
        }
        const score = scoreNameMatch(found[0], user.name);
        if (score > 0 && (!best || score > best.score)) {
          best = { user, score, matchedText: found[0] };
        }
      }
    }
  }

  if (best) {
    cleaned = cleaned.replace(new RegExp(escapeRegExp(best.matchedText), "i"), " ");
    // Also strip leftover bare name if still present.
    const first = best.user.name.split(/\s+/)[0] ?? "";
    if (first.length >= 3) {
      cleaned = cleaned.replace(new RegExp(`\\b${escapeRegExp(first)}\\b`, "i"), " ");
    }
    cleaned = cleaned.replace(
      new RegExp(`\\b${escapeRegExp(best.user.name)}\\b`, "i"),
      " ",
    );
  }

  // Clean dangling assign lead-ins left behind.
  cleaned = cleaned.replace(ASSIGNEE_LEADINS, " ");

  return {
    assigned_to: best?.user.id ?? null,
    matchedAssigneeName: best?.user.name ?? null,
    cleaned: normalizeWhitespace(cleaned),
  };
}

/**
 * Generate a concise ticket title from the spoken issue text.
 * Heuristic "AI" summarization — no external API required.
 */
export function generateTicketTitle(description: string, maxLength = 80): string {
  let text = normalizeWhitespace(description);
  text = text.replace(BOILERPLATE_PREFIX, "");
  text = text.replace(
    /\b(?:the\s+)?(?:issue|problem|bug|error)\s+is\s+(?:that\s+)?/i,
    "",
  );

  // Prefer the first sentence / clause.
  const clause = text.split(/[.!?]+/)[0]?.trim() || text;
  let title = clause.split(/,\s+(?:and\s+)?(?:then\s+)?/i)[0]?.trim() || clause;

  if (title.length > maxLength) {
    const cut = title.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(" ");
    title = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim();
  }

  title = title.replace(/[,;:\-–—]+$/, "").trim();
  if (!title) {
    return "Support request";
  }

  return title.charAt(0).toUpperCase() + title.slice(1);
}

/**
 * Parse a spoken ticket dictation into form fields.
 *
 * Example: "Users cannot reset password on billing. Priority high. Assign to Alice."
 */
export function parseVoiceTicket(transcript: string, users: User[]): ParsedVoiceTicket {
  const notes: string[] = [];
  const raw = normalizeWhitespace(transcript);

  if (!raw) {
    return {
      title: "",
      description: "",
      priority: "medium",
      assigned_to: null,
      matchedAssigneeName: null,
      priorityDetected: false,
      notes: ["No speech detected. Try again."],
    };
  }

  const priorityResult = extractPriority(raw);
  const assigneeResult = extractAssignee(priorityResult.cleaned, users);

  let description = assigneeResult.cleaned;
  description = description.replace(BOILERPLATE_PREFIX, "");
  description = normalizeWhitespace(
    description
      .replace(/\b(?:please|thanks|thank you)\b/gi, " ")
      .replace(/\s+([,.])/g, "$1")
      .replace(/^[.,;:\s]+|[.,;:\s]+$/g, ""),
  );

  if (!description) {
    description = raw;
    notes.push(
      "Could not separate issue details; used the full transcript as description.",
    );
  }

  const title = generateTicketTitle(description);

  if (priorityResult.detected) {
    notes.push(`Priority set to ${priorityResult.priority}.`);
  } else {
    notes.push("No priority heard — defaulted to medium.");
  }

  if (assigneeResult.matchedAssigneeName) {
    notes.push(`Assignee set to ${assigneeResult.matchedAssigneeName}.`);
  } else {
    notes.push("No matching assignee found — left unassigned.");
  }

  notes.push(`Title generated from your description.`);

  return {
    title,
    description,
    priority: priorityResult.priority,
    assigned_to: assigneeResult.assigned_to,
    matchedAssigneeName: assigneeResult.matchedAssigneeName,
    priorityDetected: priorityResult.detected,
    notes,
  };
}
