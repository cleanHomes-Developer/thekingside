# Worker Operations

This project uses background workers for queue processing (announcements, payouts, etc.).

## Local run

```bash
pnpm worker:announcements
```

## Systemd (Linux)

1. Copy the unit file and edit paths and environment variables.

```
[Unit]
Description=The King Side announcements worker
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/thekingside
Environment=NODE_ENV=production
Environment=REDIS_URL=redis://localhost:6379
Environment=SENDGRID_API_KEY=...
Environment=SENDGRID_FROM_EMAIL=...
ExecStart=/usr/bin/node scripts/announcements-worker.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

2. Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable thekingside-worker
sudo systemctl start thekingside-worker
```

## PM2

```bash
pm2 start scripts/announcements-worker.mjs --name tks-announcements
pm2 save
```

## Docker

Run the worker in a separate container:

```bash
docker run --rm --env-file .env --network host thekingside pnpm worker:announcements
```

## Alerts

Queue failures create audit log entries with action QUEUE_FAILURE. Review them in Admin -> Queues.
