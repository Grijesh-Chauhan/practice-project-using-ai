import { describe, expect, it } from "vitest";

import { canTransition, getAllowedNextStatuses } from "./statusTransitions";

describe("statusTransitions", () => {
  it("test_open_allows_in_progress_and_cancelled", () => {
    expect(getAllowedNextStatuses("Open")).toEqual(["In Progress", "Cancelled"]);
  });

  it("test_in_progress_allows_resolved_and_cancelled", () => {
    expect(getAllowedNextStatuses("In Progress")).toEqual(["Resolved", "Cancelled"]);
  });

  it("test_resolved_allows_closed_only", () => {
    expect(getAllowedNextStatuses("Resolved")).toEqual(["Closed"]);
  });

  it("test_terminal_statuses_have_no_transitions", () => {
    expect(getAllowedNextStatuses("Closed")).toEqual([]);
    expect(getAllowedNextStatuses("Cancelled")).toEqual([]);
  });

  it("test_same_status_transition_is_invalid", () => {
    expect(canTransition("Open", "Open")).toBe(false);
  });

  it("test_invalid_open_to_closed_is_rejected", () => {
    expect(canTransition("Open", "Closed")).toBe(false);
  });
});
