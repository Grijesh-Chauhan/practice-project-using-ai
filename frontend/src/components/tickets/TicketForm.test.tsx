import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TicketForm } from "./TicketForm";
import type { User } from "../../types";

const users: User[] = [
  {
    id: 1,
    name: "Alice Agent",
    email: "alice@example.com",
    role: "agent",
  },
  {
    id: 2,
    name: "Bob Support",
    email: "bob@example.com",
    role: "agent",
  },
];

describe("TicketForm", () => {
  it("test_ticket_form_shows_validation_errors_for_empty_required_fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TicketForm
        users={users}
        submitLabel="Create Ticket"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        defaultValues={{
          title: "",
          description: "",
          priority: "medium",
          assigned_to: null,
        }}
      />,
    );

    await user.clear(screen.getByLabelText(/title/i));
    await user.clear(screen.getByLabelText(/description/i));
    await user.click(screen.getByRole("button", { name: /create ticket/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("test_ticket_form_submits_valid_values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TicketForm
        users={users}
        submitLabel="Create Ticket"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText(/title/i), "Login issue");
    await user.type(screen.getByLabelText(/description/i), "Cannot reset password");
    await user.click(screen.getByRole("button", { name: /create ticket/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Login issue",
        description: "Cannot reset password",
        priority: "medium",
        assigned_to: null,
      });
    });
  });
});
