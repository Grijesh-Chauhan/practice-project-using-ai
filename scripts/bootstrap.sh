#!/usr/bin/env bash
# Bootstrap development environment for the Support Ticket Management System.
# Run from repository root.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Support Ticket Management — Bootstrap"
echo "Root: $ROOT"

if command -v uv >/dev/null 2>&1; then
  echo "==> Installing backend dependencies (UV)..."
  (cd backend && uv sync --group dev)
else
  echo "ERROR: uv not installed. See https://docs.astral.sh/uv/"
  exit 1
fi

if command -v npm >/dev/null 2>&1; then
  echo "==> Installing frontend dependencies (npm)..."
  (cd frontend && npm install)
else
  echo "ERROR: npm not installed. Install Node.js 20+ LTS."
  exit 1
fi

echo "==> Installing pre-commit hooks..."
(cd backend && uv run pre-commit install) || echo "    WARN: pre-commit install failed (hooks optional locally)"

echo ""
echo "==> Copy environment files if missing:"
if [ -f backend/.env.example ] && [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "    Created backend/.env"
fi
if [ -f frontend/.env.example ] && [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
  echo "    Created frontend/.env"
fi

echo ""
echo "==> Next steps:"
echo "    # Backend"
echo "    cd backend && uv run uvicorn app.main:app --reload"
echo "    # Frontend (separate terminal)"
echo "    cd frontend && npm run dev"
echo "    # Or both:"
echo "    ./scripts/run_dev.sh"
echo ""
echo "    Health check: curl http://localhost:8000/health"
