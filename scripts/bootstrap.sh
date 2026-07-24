#!/usr/bin/env bash
# Bootstrap development environment.
# Run from repository root after backend/frontend scaffolds exist (Phase 3–4).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Support Ticket Management — Bootstrap"
echo "Root: $ROOT"

if command -v uv >/dev/null 2>&1; then
  echo "==> Installing backend dependencies (UV)..."
  if [ -f backend/pyproject.toml ]; then
    (cd backend && uv sync)
  else
    echo "    Skip: backend/pyproject.toml not found (Phase 3)"
  fi
else
  echo "WARN: uv not installed. See https://docs.astral.sh/uv/"
fi

if command -v npm >/dev/null 2>&1; then
  echo "==> Installing frontend dependencies (npm)..."
  if [ -f frontend/package.json ]; then
    (cd frontend && npm install)
  else
    echo "    Skip: frontend/package.json not found (Phase 4)"
  fi
else
  echo "WARN: npm not installed."
fi

if [ -f backend/pyproject.toml ] && command -v uv >/dev/null 2>&1; then
  echo "==> Installing pre-commit hooks..."
  (cd backend && uv run pre-commit install) 2>/dev/null || echo "    Skip: pre-commit not configured yet"
fi

echo ""
echo "==> Copy environment files if missing:"
[ -f backend/.env.example ] && [ ! -f backend/.env ] && cp backend/.env.example backend/.env && echo "    Created backend/.env"
[ -f frontend/.env.example ] && [ ! -f frontend/.env ] && cp frontend/.env.example frontend/.env && echo "    Created frontend/.env"

echo ""
echo "==> Next steps (after implementation):"
echo "    cd backend && uv run alembic upgrade head"
echo "    uv run python ../scripts/seed_db.py"
echo "    uv run uvicorn app.main:app --reload"
echo "    cd frontend && npm run dev"
