import { describe, expect, it } from "vitest";

import type { User } from "../types";
import { generateTicketTitle, parseVoiceTicket } from "./parseVoiceTicket";

const users: User[] = [
  {
    id: 1,
    name: "Alice Agent",
    email: "alice@example.com",
    role: "agent",
  },
  {
    id: 2,
    name: "Bob Agent",
    email: "bob@example.com",
    role: "agent",
  },
  {
    id: 3,
    name: "Carol Admin",
    email: "carol@example.com",
    role: "admin",
  },
];

describe("parseVoiceTicket", () => {
  it("fills all four fields from a full dictation", () => {
    const parsed = parseVoiceTicket(
      "Create a ticket. Users cannot reset password on billing. Priority high. Assign to Alice.",
      users,
    );

    expect(parsed.priority).toBe("high");
    expect(parsed.priorityDetected).toBe(true);
    expect(parsed.assigned_to).toBe(1);
    expect(parsed.matchedAssigneeName).toBe("Alice Agent");
    expect(parsed.description.toLowerCase()).toContain("cannot reset password");
    expect(parsed.description.toLowerCase()).not.toContain("priority");
    expect(parsed.description.toLowerCase()).not.toMatch(/\balice\b/);
    expect(parsed.title.toLowerCase()).toContain("cannot reset password");
    expect(parsed.title.length).toBeLessThanOrEqual(80);
  });

  it("defaults priority to medium and assignee to null when missing", () => {
    const parsed = parseVoiceTicket(
      "The dashboard charts are empty after login",
      users,
    );

    expect(parsed.priority).toBe("medium");
    expect(parsed.priorityDetected).toBe(false);
    expect(parsed.assigned_to).toBeNull();
    expect(parsed.title.length).toBeGreaterThan(0);
    expect(parsed.description).toMatch(/dashboard charts/i);
  });

  it("maps urgent to high priority", () => {
    const parsed = parseVoiceTicket(
      "API timeouts on checkout. Urgent priority. Assign to Bob.",
      users,
    );

    expect(parsed.priority).toBe("high");
    expect(parsed.assigned_to).toBe(2);
  });

  it("matches full assignee names", () => {
    const parsed = parseVoiceTicket(
      "Export fails. Priority low. Assigned to Carol Admin.",
      users,
    );

    expect(parsed.assigned_to).toBe(3);
    expect(parsed.priority).toBe("low");
  });

  it("returns a note when transcript is empty", () => {
    const parsed = parseVoiceTicket("   ", users);
    expect(parsed.title).toBe("");
    expect(parsed.notes[0]).toMatch(/no speech/i);
  });
});

describe("generateTicketTitle", () => {
  it("strips boilerplate and truncates long text", () => {
    const title = generateTicketTitle(
      "Create a ticket for customers who cannot complete checkout because the payment gateway keeps returning a timeout after three retries on the billing page",
      60,
    );

    expect(title.toLowerCase()).not.toContain("create a ticket");
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.charAt(0)).toBe(title.charAt(0).toUpperCase());
  });
});
