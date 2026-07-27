import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { getErrorMessage } from "../api/errors";
import { CommentForm } from "../components/comments/CommentForm";
import { CommentList } from "../components/comments/CommentList";
import { ErrorAlert } from "../components/common/ErrorAlert";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import { PriorityBadge } from "../components/common/PriorityBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatusSelector } from "../components/tickets/StatusSelector";
import { useCreateComment } from "../hooks/useCreateComment";
import { useTicket } from "../hooks/useTicket";
import { useUpdateTicketStatus } from "../hooks/useUpdateTicketStatus";
import { useUsers } from "../hooks/useUsers";
import type { CommentFormValues } from "../schemas/ticketForm";
import type { TicketStatus } from "../types";
import { formatDate } from "../utils/formatDate";

export function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticketId = Number.parseInt(id ?? "", 10);
  const hasValidId = Number.isFinite(ticketId) && ticketId > 0;

  const ticketQuery = useTicket(hasValidId ? ticketId : undefined);
  const usersQuery = useUsers();
  const statusMutation = useUpdateTicketStatus(ticketId);
  const commentMutation = useCreateComment(ticketId);

  const [statusError, setStatusError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const usersById = useMemo(() => {
    return new Map((usersQuery.data ?? []).map((user) => [user.id, user] as const));
  }, [usersQuery.data]);

  const ticket = ticketQuery.data;

  const resolveUser = (userId: number | null | undefined) => {
    if (userId == null) {
      return "Unassigned";
    }
    return usersById.get(userId)?.name ?? `User #${userId}`;
  };

  const handleStatusChange = async (status: TicketStatus) => {
    setStatusError(null);
    try {
      await statusMutation.mutateAsync(status);
    } catch (error) {
      setStatusError(getErrorMessage(error));
    }
  };

  const handleCommentSubmit = async (values: CommentFormValues) => {
    setCommentError(null);
    try {
      await commentMutation.mutateAsync({ message: values.message });
    } catch (error) {
      setCommentError(getErrorMessage(error));
      throw error;
    }
  };

  if (!hasValidId) {
    return (
      <ErrorAlert
        message="Invalid ticket id."
        action={
          <Button color="inherit" size="small" onClick={() => navigate("/tickets")}>
            Back to list
          </Button>
        }
      />
    );
  }

  if (ticketQuery.isLoading) {
    return <LoadingState variant="detail" />;
  }

  if (ticketQuery.isError || !ticket) {
    return (
      <ErrorAlert
        message={getErrorMessage(ticketQuery.error ?? new Error("Ticket not found"))}
        onRetry={() => void ticketQuery.refetch()}
      />
    );
  }

  return (
    <>
      <PageHeader
        title={ticket.title}
        actions={
          <>
            <Button component={RouterLink} to="/tickets" variant="outlined">
              Back to list
            </Button>
            <Button
              component={RouterLink}
              to={`/tickets/${ticket.id}/edit`}
              variant="contained"
            >
              Edit
            </Button>
          </>
        }
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <StatusBadge status={ticket.status} size="medium" />
        <PriorityBadge priority={ticket.priority} size="medium" />
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <Typography sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
              {ticket.description}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Assignee:</strong> {resolveUser(ticket.assigned_to)}
              </Typography>
              <Typography variant="body2">
                <strong>Created by:</strong> {resolveUser(ticket.created_by)}
              </Typography>
              <Typography variant="body2">
                <strong>Created:</strong> {formatDate(ticket.created_at)}
              </Typography>
              <Typography variant="body2">
                <strong>Updated:</strong> {formatDate(ticket.updated_at)}
              </Typography>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            <CommentList comments={ticket.comments} usersById={usersById} />
            <Divider sx={{ my: 2 }} />
            <CommentForm
              onSubmit={handleCommentSubmit}
              apiError={commentError}
              isSubmitting={commentMutation.isPending}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <StatusSelector
              currentStatus={ticket.status}
              onChange={(status) => {
                void handleStatusChange(status);
              }}
              isUpdating={statusMutation.isPending}
              errorMessage={statusError}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
