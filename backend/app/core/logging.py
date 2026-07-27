"""Logging configuration helpers."""

from __future__ import annotations

import logging
import sys


def configure_logging(level: str = "INFO") -> None:
    """Configure root application logging to stderr."""
    log_level = getattr(logging, level.upper(), logging.INFO)
    root = logging.getLogger()
    root.setLevel(log_level)

    if not root.handlers:
        handler = logging.StreamHandler(sys.stderr)
        handler.setLevel(log_level)
        handler.setFormatter(
            logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s")
        )
        root.addHandler(handler)

    # Alembic fileConfig may leave existing loggers disabled; re-enable ours.
    app_logger = logging.getLogger("app")
    app_logger.disabled = False
    app_logger.setLevel(log_level)
