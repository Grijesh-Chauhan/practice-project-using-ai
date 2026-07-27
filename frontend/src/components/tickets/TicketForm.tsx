import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { ticketFormSchema, type TicketFormValues } from "../../schemas/ticketForm";
import type { User } from "../../types";
import { PRIORITIES } from "../../utils/constants";

interface TicketFormProps {
  users: User[];
  defaultValues?: Partial<TicketFormValues>;
  submitLabel: string;
  onSubmit: (values: TicketFormValues) => Promise<void> | void;
  onCancel: () => void;
  apiError?: string | null;
  isSubmitting?: boolean;
}

const emptyDefaults: TicketFormValues = {
  title: "",
  description: "",
  priority: "medium",
  assigned_to: null,
};

export function TicketForm({
  users,
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
  apiError,
  isSubmitting = false,
}: TicketFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          ...values,
          assigned_to: values.assigned_to ?? null,
        });
      })}
    >
      <Stack spacing={2.5}>
        {apiError ? <Alert severity="error">{apiError}</Alert> : null}

        <TextField
          label="Title"
          {...register("title")}
          error={Boolean(errors.title)}
          helperText={errors.title?.message}
          fullWidth
          required
          inputProps={{ maxLength: 255 }}
        />

        <TextField
          label="Description"
          {...register("description")}
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
          fullWidth
          required
          multiline
          minRows={4}
        />

        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={Boolean(errors.priority)} required>
              <InputLabel id="ticket-priority-label">Priority</InputLabel>
              <Select labelId="ticket-priority-label" label="Priority" {...field}>
                {PRIORITIES.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
              {errors.priority ? (
                <FormHelperText>{errors.priority.message}</FormHelperText>
              ) : null}
            </FormControl>
          )}
        />

        <Controller
          name="assigned_to"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="ticket-assignee-label">Assignee</InputLabel>
              <Select
                labelId="ticket-assignee-label"
                label="Assignee"
                value={field.value == null ? "" : String(field.value)}
                onChange={(event) => {
                  const raw = String(event.target.value);
                  field.onChange(raw === "" ? null : Number(raw));
                }}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={String(user.id)}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
