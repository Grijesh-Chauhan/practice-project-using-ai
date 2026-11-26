import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StatusCountsPanel } from "./StatusCountsPanel";
import type { StatusCounts } from "../../hooks/useTicketStatusCounts";

const counts: StatusCounts = {
  Open: 2,
  "In Progress": 1,
  Resolved: 0,
  Closed: 1,
  Cancelled: 0,
};

describe("StatusCountsPanel", () => {
  it("renders status boxes plus an All count box", () => {
    render(
      <StatusCountsPanel counts={counts} dateRange="6m" onDateRangeChange={vi.fn()} />,
    );

    expect(screen.getByLabelText("Ticket status counts")).toBeInTheDocument();
    expect(screen.getByLabelText("All: 4 tickets")).toBeInTheDocument();
    expect(screen.getByLabelText("Open: 2 tickets")).toBeInTheDocument();
    expect(screen.getByLabelText("In Progress: 1 tickets")).toBeInTheDocument();
  });

  it("calls onSelectStatus when a status box is clicked", async () => {
    const user = userEvent.setup();
    const onSelectStatus = vi.fn();

    render(
      <StatusCountsPanel
        counts={counts}
        selectedStatus=""
        onSelectStatus={onSelectStatus}
        dateRange="6m"
        onDateRangeChange={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText("Open: 2 tickets"));
    expect(onSelectStatus).toHaveBeenCalledWith("Open");
  });

  it("calls onSelectStatus with empty string when All is clicked", async () => {
    const user = userEvent.setup();
    const onSelectStatus = vi.fn();

    render(
      <StatusCountsPanel
        counts={counts}
        selectedStatus="Open"
        onSelectStatus={onSelectStatus}
        dateRange="6m"
        onDateRangeChange={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText("All: 4 tickets"));
    expect(onSelectStatus).toHaveBeenCalledWith("");
  });

  it("exposes a date range filter for counts", () => {
    render(
      <StatusCountsPanel counts={counts} dateRange="1y" onDateRangeChange={vi.fn()} />,
    );

    expect(screen.getByLabelText("Filter by date range")).toBeInTheDocument();
  });
});
