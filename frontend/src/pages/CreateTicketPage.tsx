import Paper from "@mui/material/Paper";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getErrorMessage } from "../api/errors";
import { ErrorAlert } from "../components/common/ErrorAlert";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import { TicketForm } from "../components/tickets/TicketForm";
import { useCreateTicket } from "../hooks/useCreateTicket";
import { useUsers } from "../hooks/useUsers";
import type { TicketFormValues } from "../schemas/ticketForm";

export function CreateTicketPage() {
  const navigate = useNavigate();
  const usersQuery = useUsers();
  const createMutation = useCreateTicket();
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (values: TicketFormValues) => {
    setApiError(null);
    try {
      const ticket = await createMutation.mutateAsync({
        title: values.title,
        description: values.description,
        priority: values.priority,
        assigned_to: values.assigned_to ?? null,
      });
      navigate(`/tickets/${ticket.id}`);
    } catch (error) {
      setApiError(getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader title="Create Ticket" subtitle="New tickets start in Open status" />

      {usersQuery.isError ? (
        <ErrorAlert
          message={getErrorMessage(usersQuery.error)}
          onRetry={() => void usersQuery.refetch()}
        />
      ) : null}

      {usersQuery.isLoading ? (
        <LoadingState />
      ) : (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <TicketForm
            users={usersQuery.data ?? []}
            submitLabel="Create Ticket"
            onSubmit={handleSubmit}
            onCancel={() => navigate("/tickets")}
            apiError={apiError}
            isSubmitting={createMutation.isPending}
          />
        </Paper>
      )}
    </>
  );
}
