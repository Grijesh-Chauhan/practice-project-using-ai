import Paper from "@mui/material/Paper";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getErrorMessage } from "../api/errors";
import { ErrorAlert } from "../components/common/ErrorAlert";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import { TicketForm } from "../components/tickets/TicketForm";
import { useTicket } from "../hooks/useTicket";
import { useUpdateTicket } from "../hooks/useUpdateTicket";
import { useUsers } from "../hooks/useUsers";
import type { TicketFormValues } from "../schemas/ticketForm";

export function EditTicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticketId = Number.parseInt(id ?? "", 10);
  const hasValidId = Number.isFinite(ticketId) && ticketId > 0;

  const ticketQuery = useTicket(hasValidId ? ticketId : undefined);
  const usersQuery = useUsers();
  const updateMutation = useUpdateTicket(ticketId);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!hasValidId) {
    return <ErrorAlert message="Invalid ticket id." />;
  }

  if (ticketQuery.isLoading || usersQuery.isLoading) {
    return <LoadingState variant="detail" />;
  }

  if (ticketQuery.isError || !ticketQuery.data) {
    return (
      <ErrorAlert
        message={getErrorMessage(ticketQuery.error ?? new Error("Not found"))}
        onRetry={() => void ticketQuery.refetch()}
      />
    );
  }

  const ticket = ticketQuery.data;

  const handleSubmit = async (values: TicketFormValues) => {
    setApiError(null);
    try {
      await updateMutation.mutateAsync({
        title: values.title,
        description: values.description,
        priority: values.priority,
        assigned_to: values.assigned_to ?? null,
      });
      navigate(`/tickets/${ticketId}`);
    } catch (error) {
      setApiError(getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        title="Edit Ticket"
        subtitle={`#${ticket.id} · Status is changed on the detail page`}
      />
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <TicketForm
          users={usersQuery.data ?? []}
          defaultValues={{
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            assigned_to: ticket.assigned_to,
          }}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/tickets/${ticketId}`)}
          apiError={apiError}
          isSubmitting={updateMutation.isPending}
        />
      </Paper>
    </>
  );
}
