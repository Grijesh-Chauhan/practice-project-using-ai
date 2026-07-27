import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TicketTable } from "./TicketTable";
import type { Ticket, User } from "../../types";

const usersById = new Map<number, User>([
  [
    2,
    {
      id: 2,
      name: "Bob Support",
      email: "bob@example.com",
      role: "agent",
    },
  ],
]);

const tickets: Ticket[] = [
  {
    id: 1,
    title: "Login issue",
    description: "Cannot reset password",
    priority: "high",
    status: "Open",
    assigned_to: 2,
    created_by: 1,
    created_at: "2026-07-24T08:00:00Z",
    updated_at: "2026-07-24T08:00:00Z",
  },
];

describe("TicketTable", () => {
  it("test_ticket_table_shows_empty_state", () => {
    render(
      <TicketTable
        tickets={[]}
        usersById={usersById}
        total={0}
        page={0}
        pageSize={20}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onRowClick={vi.fn()}
      />,
    );

    expect(screen.getByText(/no tickets found/i)).toBeInTheDocument();
  });

  it("test_ticket_table_row_click_navigates", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    render(
      <TicketTable
        tickets={tickets}
        usersById={usersById}
        total={1}
        page={0}
        pageSize={20}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onRowClick={onRowClick}
      />,
    );

    await user.click(screen.getByText("Login issue"));
    expect(onRowClick).toHaveBeenCalledWith(1);
  });
});
