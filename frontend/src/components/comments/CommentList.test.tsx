import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CommentList } from "./CommentList";
import type { Comment, User } from "../../types";

const usersById = new Map<number, User>([
  [
    1,
    {
      id: 1,
      name: "Alice Agent",
      email: "alice@example.com",
      role: "agent",
    },
  ],
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

const comments: Comment[] = [
  {
    id: 1,
    ticket_id: 10,
    message: "Oldest comment",
    created_by: 1,
    created_at: "2026-07-01T10:00:00Z",
  },
  {
    id: 2,
    ticket_id: 10,
    message: "Newest comment",
    created_by: 2,
    created_at: "2026-07-02T10:00:00Z",
  },
];

describe("CommentList", () => {
  it("test_comment_list_renders_empty_state", () => {
    render(<CommentList comments={[]} usersById={usersById} />);
    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
  });

  it("test_comment_list_renders_comments_in_order_with_authors", () => {
    render(<CommentList comments={comments} usersById={usersById} />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Oldest comment");
    expect(items[0]).toHaveTextContent("Alice Agent");
    expect(items[1]).toHaveTextContent("Newest comment");
    expect(items[1]).toHaveTextContent("Bob Support");
  });
});
