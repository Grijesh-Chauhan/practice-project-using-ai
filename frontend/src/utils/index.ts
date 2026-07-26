/** Shared frontend utilities (CSV helpers added later). */

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}
