#!/usr/bin/env bash
set -euo pipefail

if [[ -f ./.env ]]; then
  set -a
  source ./.env
  set +a
fi

BASE_URL="${BASE_URL:-${APP_BASE_URL:-http://127.0.0.1:3000}}"
ADMIN_USERNAME="${ADMIN_USERNAME:-}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

if [[ -z "$ADMIN_USERNAME" || -z "$ADMIN_PASSWORD" ]]; then
  echo "ADMIN_USERNAME and ADMIN_PASSWORD must be set to run JFA sync." >&2
  exit 1
fi

curl --fail-with-body --silent --show-error \
  -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" \
  -X POST \
  "$BASE_URL/api/jfa/sync"
