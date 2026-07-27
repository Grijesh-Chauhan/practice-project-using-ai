import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import type { Comment, User } from "../../types";
import { formatDate } from "../../utils/formatDate";

interface CommentListProps {
  comments: Comment[];
  usersById: Map<number, User>;
}

export function CommentList({ comments, usersById }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 1 }}>
        No comments yet.
      </Typography>
    );
  }

  return (
    <List disablePadding aria-label="Comments">
      {comments.map((comment, index) => {
        const author =
          usersById.get(comment.created_by)?.name ?? `User #${comment.created_by}`;

        return (
          <ListItem
            key={comment.id}
            alignItems="flex-start"
            sx={{ px: 0 }}
            divider={index < comments.length - 1}
          >
            <ListItemText
              primary={comment.message}
              secondary={`${author} · ${formatDate(comment.created_at)}`}
              slotProps={{
                primary: { sx: { whiteSpace: "pre-wrap" } },
              }}
            />
          </ListItem>
        );
      })}
    </List>
  );
}
