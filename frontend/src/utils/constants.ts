import type { Priority, TicketStatus } from "../types";

export const TICKET_STATUSES: TicketStatus[] = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
  "Cancelled",
];

export const PRIORITIES: Priority[] = ["low", "medium", "high"];

export const DEFAULT_PAGE_SIZE = 20;

export const SEARCH_DEBOUNCE_MS = 300;
