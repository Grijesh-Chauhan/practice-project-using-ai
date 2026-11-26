import { describe, expect, it } from "vitest";

import { createdAfterFromPreset } from "./constants";

describe("createdAfterFromPreset", () => {
  const now = new Date("2026-07-28T12:00:00.000Z");

  it("returns undefined for All", () => {
    expect(createdAfterFromPreset("all", now)).toBeUndefined();
  });

  it("returns an ISO cutoff 6 months before now by default preset", () => {
    const cutoff = createdAfterFromPreset("6m", now);
    expect(cutoff).toBe(new Date("2026-01-28T12:00:00.000Z").toISOString());
  });

  it("supports 1 year, 2 years, and 4 years presets", () => {
    expect(createdAfterFromPreset("1y", now)).toBe(
      new Date("2025-07-28T12:00:00.000Z").toISOString(),
    );
    expect(createdAfterFromPreset("2y", now)).toBe(
      new Date("2024-07-28T12:00:00.000Z").toISOString(),
    );
    expect(createdAfterFromPreset("4y", now)).toBe(
      new Date("2022-07-28T12:00:00.000Z").toISOString(),
    );
  });
});
