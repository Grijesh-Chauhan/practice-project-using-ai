import type { Priority, TicketStatus } from "../types";

export const TICKET_STATUSES: TicketStatus[] = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
  "Cancelled",
];

export const PRIORITIES: Priority[] = ["low", "medium", "high"];

export const DEFAULT_PAGE_SIZE = 10;

export const PAGE_SIZE_OPTIONS = [5, 10] as const;

export const SEARCH_DEBOUNCE_MS = 300;

/** Preset windows for created_at filtering (list + status counts). */
export type DateRangePreset = "6m" | "1y" | "2y" | "4y" | "all";

export const DEFAULT_DATE_RANGE: DateRangePreset = "6m";

export const DATE_RANGE_OPTIONS: ReadonlyArray<{
  value: DateRangePreset;
  label: string;
}> = [
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last 1 year" },
  { value: "2y", label: "Last 2 years" },
  { value: "4y", label: "Last 4 years" },
  { value: "all", label: "All" },
];

const PRESET_MONTHS: Record<Exclude<DateRangePreset, "all">, number> = {
  "6m": 6,
  "1y": 12,
  "2y": 24,
  "4y": 48,
};

/** ISO datetime for API `created_after`, or undefined when preset is All. */
export function createdAfterFromPreset(
  preset: DateRangePreset,
  now: Date = new Date(),
): string | undefined {
  if (preset === "all") {
    return undefined;
  }
  const cutoff = new Date(now.getTime());
  cutoff.setMonth(cutoff.getMonth() - PRESET_MONTHS[preset]);
  return cutoff.toISOString();
}
