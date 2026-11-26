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

function titleField() {
  return screen.getByRole("textbox", { name: /^title$/i });
}

function descriptionField() {
  return screen.getByRole("textbox", { name: /^description$/i });
}

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
        enableVoiceTyping={false}
        defaultValues={{
          title: "",
          description: "",
          priority: "medium",
          assigned_to: null,
        }}
      />,
    );

    await user.clear(titleField());
    await user.clear(descriptionField());
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
        enableVoiceTyping={false}
      />,
    );

    await user.type(titleField(), "Login issue");
    await user.type(descriptionField(), "Cannot reset password");
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

  it("shows a single voice fill control when enabled", () => {
    render(
      <TicketForm
        users={users}
        submitLabel="Create Ticket"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText(/speak the issue, say the priority/i)).toBeInTheDocument();
    // jsdom has no SpeechRecognition → unavailable control
    expect(
      screen.getByRole("button", { name: /voice fill unavailable/i }),
    ).toBeInTheDocument();
  });
});
