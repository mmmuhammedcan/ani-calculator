#!/usr/bin/env bash
# Deployment/run script for the Scooter Fee API (local development).
#
# Usage:
#   ./run.sh          # create venv (if missing), install deps, start the server
#
# Once running, interactive API docs are available at:
#   http://127.0.0.1:8000/docs   (Swagger UI)
#   http://127.0.0.1:8000/redoc  (ReDoc)

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r requirements.txt

exec .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
