# Production deployment for innotel.us

## Host layout

- `subscribe.innotel.us` → this Next.js subscription portal
- `accounts.innotel.us` → JFA-Go upstream on `127.0.0.1:8056`

## Files

- `docker-compose.production.yml`
- `deploy/Caddyfile`
- `deploy/.env.production.example`
- `scripts/docker-entrypoint.sh`

## First-time setup

1. Copy the env template:
   ```bash
   cp deploy/.env.production.example .env
   ```
2. Fill in real values for Stripe, JFA-Go, admin auth, and optional SMTP.
   - `ADMIN_USERNAME` and `ADMIN_PASSWORD` protect `/admin`, `/api/admin/*`, and `/api/jfa/*`.
   - These app admin credentials are separate from `JFA_ADMIN_USERNAME` / `JFA_ADMIN_PASSWORD`.
3. Make sure DNS for `subscribe.innotel.us` points at this host.
4. Make sure JFA-Go is reachable on `127.0.0.1:8056` from the host.

## Start the stack

```bash
docker compose -f docker-compose.production.yml up -d --build
```

## Verify deployment

```bash
docker compose -f docker-compose.production.yml ps
curl -s https://subscribe.innotel.us/api/health
curl -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" https://subscribe.innotel.us/api/jfa/sync
```

## systemd user service (non-Docker)

A ready-to-install user unit is available at:

- `deploy/jellyfin-subscriptions.service`
- `~/.config/systemd/user/jellyfin-subscriptions.service`

Recommended commands on the host:

```bash
systemctl --user daemon-reload
systemctl --user enable --now jellyfin-subscriptions.service
systemctl --user status --no-pager jellyfin-subscriptions.service
journalctl --user -u jellyfin-subscriptions.service -n 100 --no-pager
```

The service expects:

- app code in `/home/claude/workspace/jellyfin-subscriptions`
- production build already created with `npm run build`
- runtime config in `.env`
- app to listen on port `3000` for Nginx Proxy Manager

## Notes

- The app container runs `prisma migrate deploy` on startup before `next start`.
- Caddy terminates TLS for `subscribe.innotel.us` and proxies `accounts.innotel.us` to the host JFA-Go process.
- If JFA-Go is not on the same machine, replace `host.docker.internal:8056` in `deploy/Caddyfile` with the real upstream.
- SQLite is persisted in the `sqlite-data` named Docker volume.
- If `ADMIN_USERNAME` or `ADMIN_PASSWORD` is blank, protected admin/JFA routes will return `401 Authentication required`.
