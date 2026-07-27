import axios from "axios";
import { describe, expect, it } from "vitest";

import { ApiError, getErrorMessage, toApiError } from "./errors";

describe("api errors", () => {
  it("test_to_api_error_extracts_detail_from_axios_response", () => {
    const axiosError = new axios.AxiosError(
      "Request failed",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 409,
        statusText: "Conflict",
        headers: {},
        config: { headers: {} } as never,
        data: {
          detail: "Cannot transition from Open to Closed",
          code: "INVALID_STATUS_TRANSITION",
        },
      },
    );

    const error = toApiError(axiosError);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Cannot transition from Open to Closed");
    expect(error.status).toBe(409);
    expect(error.code).toBe("INVALID_STATUS_TRANSITION");
  });

  it("test_get_error_message_from_api_error", () => {
    const message = getErrorMessage(
      new ApiError("Ticket not found", {
        status: 404,
        code: "TICKET_NOT_FOUND",
      }),
    );
    expect(message).toBe("Ticket not found");
  });
});
