import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StatusSelector } from "./StatusSelector";

describe("StatusSelector", () => {
  it("test_status_selector_shows_only_valid_options_for_open", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<StatusSelector currentStatus="Open" onChange={onChange} />);

    await user.click(screen.getByLabelText("Change status to"));
    expect(screen.getByRole("option", { name: "In Progress" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Cancelled" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Closed" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Resolved" })).not.toBeInTheDocument();
  });

  it("test_status_selector_disables_controls_for_closed", () => {
    render(<StatusSelector currentStatus="Closed" onChange={vi.fn()} />);

    expect(
      screen.getByText(/no further status changes are allowed/i),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Change status to")).not.toBeInTheDocument();
  });
});
