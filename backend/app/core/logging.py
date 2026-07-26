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

    logging.getLogger("app").setLevel(log_level)
