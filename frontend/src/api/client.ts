import axios from "axios";

import { toApiError } from "./errors";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
const defaultUserId = import.meta.env.VITE_DEFAULT_USER_ID ?? "1";

export const DEFAULT_USER_ID = Number.parseInt(defaultUserId, 10) || 1;

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "X-User-Id": String(DEFAULT_USER_ID),
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    // Blob responses (e.g. CSV export) may still return JSON error bodies.
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const body = JSON.parse(text) as {
          detail?: string;
          code?: string;
          field?: string;
        };
        if (typeof body.detail === "string") {
          error.response.data = body;
        }
      } catch {
        // Keep original blob/error if parsing fails.
      }
    }

    const apiError = toApiError(error);
    if (import.meta.env.DEV) {
      console.error("[api]", apiError.message, {
        status: apiError.status,
        code: apiError.code,
        field: apiError.field,
      });
    }
    return Promise.reject(apiError);
  },
);
