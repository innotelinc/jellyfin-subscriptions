#!/usr/bin/env bash
set -euo pipefail

npx prisma migrate deploy
exec npm run start
