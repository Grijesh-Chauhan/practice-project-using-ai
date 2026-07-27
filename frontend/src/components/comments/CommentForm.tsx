import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { commentFormSchema, type CommentFormValues } from "../../schemas/ticketForm";

interface CommentFormProps {
  onSubmit: (values: CommentFormValues) => Promise<void> | void;
  apiError?: string | null;
  isSubmitting?: boolean;
}

export function CommentForm({
  onSubmit,
  apiError,
  isSubmitting = false,
}: CommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: { message: "" },
  });

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
        reset({ message: "" });
      })}
    >
      <Stack spacing={1.5}>
        {apiError ? <Alert severity="error">{apiError}</Alert> : null}
        <TextField
          label="Add a comment"
          {...register("message")}
          error={Boolean(errors.message)}
          helperText={errors.message?.message}
          fullWidth
          multiline
          minRows={3}
          inputProps={{ maxLength: 5000, "aria-label": "Comment message" }}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add Comment"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
