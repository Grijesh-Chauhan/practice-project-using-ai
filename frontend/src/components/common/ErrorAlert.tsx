import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import type { ReactNode } from "react";

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export function ErrorAlert({ message, onRetry, action }: ErrorAlertProps) {
  return (
    <Alert
      severity="error"
      sx={{ mb: 2 }}
      action={
        action ??
        (onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined)
      }
    >
      {message}
    </Alert>
  );
}
