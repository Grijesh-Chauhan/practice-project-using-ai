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
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ticketFormSchema, type TicketFormValues } from "../../schemas/ticketForm";
import type { User } from "../../types";
import { PRIORITIES } from "../../utils/constants";
import type { ParsedVoiceTicket } from "../../utils/parseVoiceTicket";
import { VoiceTicketFillButton } from "../common/VoiceTicketFillButton";

interface TicketFormProps {
  users: User[];
  defaultValues?: Partial<TicketFormValues>;
  submitLabel: string;
  onSubmit: (values: TicketFormValues) => Promise<void> | void;
  onCancel: () => void;
  apiError?: string | null;
  isSubmitting?: boolean;
  /** Show the single voice-fill control (default true). */
  enableVoiceTyping?: boolean;
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
  enableVoiceTyping = true,
}: TicketFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<string[] | null>(null);

  const applyParsedVoice = useCallback(
    (parsed: ParsedVoiceTicket) => {
      if (parsed.title) {
        setValue("title", parsed.title, { shouldDirty: true, shouldValidate: true });
      }
      if (parsed.description) {
        setValue("description", parsed.description, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      setValue("priority", parsed.priority, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("assigned_to", parsed.assigned_to, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setVoiceNotes(parsed.notes);
      setInterim("");
    },
    [setValue],
  );

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
        {voiceError ? <Alert severity="warning">{voiceError}</Alert> : null}

        {enableVoiceTyping ? (
          <Stack spacing={1}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Typography variant="body2" color="text.secondary">
                Speak the issue, say the priority (low / medium / high), and name an
                assignee. We generate the title and fill the form — review before
                creating.
              </Typography>
              <VoiceTicketFillButton
                users={users}
                disabled={isSubmitting}
                onParsed={applyParsedVoice}
                onListeningChange={setIsListening}
                onInterimChange={setInterim}
                onError={setVoiceError}
              />
            </Stack>
            {isListening ? (
              <Alert severity="info">
                Listening… example: &ldquo;Cannot reset password on billing. Priority
                high. Assign to Alice.&rdquo;
                {interim ? (
                  <Typography component="span" display="block" sx={{ mt: 1 }}>
                    Hearing: {interim}
                  </Typography>
                ) : null}
              </Alert>
            ) : null}
            {voiceNotes && voiceNotes.length > 0 ? (
              <Alert severity="success" onClose={() => setVoiceNotes(null)}>
                {voiceNotes.join(" ")}
              </Alert>
            ) : null}
          </Stack>
        ) : null}

        <TextField
          label="Title"
          {...register("title")}
          error={Boolean(errors.title)}
          helperText={
            errors.title?.message ??
            "Auto-generated from voice when you use Fill with voice"
          }
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
