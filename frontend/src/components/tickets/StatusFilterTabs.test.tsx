import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StatusFilterTabs } from "./StatusFilterTabs";
import type { StatusCounts } from "../../hooks/useTicketStatusCounts";

const counts: StatusCounts = {
  Open: 2,
  "In Progress": 1,
  Resolved: 0,
  Closed: 1,
  Cancelled: 0,
};

describe("StatusFilterTabs", () => {
  it("renders All plus each status tab with counts", () => {
    render(<StatusFilterTabs value="" onChange={vi.fn()} counts={counts} />);

    expect(screen.getByLabelText("Filter by status")).toBeInTheDocument();
    expect(screen.getByLabelText("All: 4 tickets")).toBeInTheDocument();
    expect(screen.getByLabelText("Open: 2 tickets")).toBeInTheDocument();
    expect(screen.getByLabelText("All: 4 tickets")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("calls onChange when a status tab is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<StatusFilterTabs value="" onChange={onChange} counts={counts} />);

    await user.click(screen.getByLabelText("Open: 2 tickets"));
    expect(onChange).toHaveBeenCalledWith("Open");
  });

  it("calls onChange with empty string when All is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<StatusFilterTabs value="Open" onChange={onChange} counts={counts} />);

    await user.click(screen.getByLabelText("All: 4 tickets"));
    expect(onChange).toHaveBeenCalledWith("");
  });
});
