import axios from "axios";

import type { ApiErrorBody } from "../types";

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly field?: string;

  constructor(
    message: string,
    options?: { status?: number; code?: string; field?: string },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.code = options?.code;
    this.field = options?.field;
  }
}

function formatDetail(detail: ApiErrorBody["detail"]): string {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join("; ");
  }

  return "An unexpected error occurred";
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorBody | undefined;

    if (data?.detail !== undefined) {
      return new ApiError(formatDetail(data.detail), {
        status,
        code: data.code,
        field: data.field,
      });
    }

    if (error.code === "ERR_NETWORK") {
      return new ApiError("Unable to reach the API. Confirm the backend is running.", {
        status,
      });
    }

    return new ApiError(error.message || "Request failed", { status });
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError("An unexpected error occurred");
}

export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}
