import type { TicketStatus } from "../types";

/** Allowed next statuses per docs/ui-flow.md and api-contract.md. */
export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  Open: ["In Progress", "Cancelled"],
  "In Progress": ["Resolved", "Cancelled"],
  Resolved: ["Closed"],
  Closed: [],
  Cancelled: [],
};

export function getAllowedNextStatuses(current: TicketStatus): TicketStatus[] {
  return ALLOWED_TRANSITIONS[current] ?? [];
}

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return getAllowedNextStatuses(from).includes(to);
}
