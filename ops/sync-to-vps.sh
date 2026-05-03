#!/usr/bin/env bash
set -euo pipefail

SERVER="${SERVER:-root@178.128.57.32}"
REMOTE_DIR="${REMOTE_DIR:-/opt/resort-geh/app/}"
APP_USER="${APP_USER:-resortgeh}"
APP_GROUP="${APP_GROUP:-$APP_USER}"

ssh "$SERVER" "mkdir -p '${REMOTE_DIR%/}'"

rsync -az --delete \
  --exclude '.git' \
  --exclude '.next' \
  --exclude 'node_modules' \
  --exclude '.env.local' \
  --exclude '.DS_Store' \
  --exclude 'sqlite.db-shm' \
  --exclude 'sqlite.db-wal' \
  ./ "$SERVER:$REMOTE_DIR"

ssh "$SERVER" "chown -R '$APP_USER:$APP_GROUP' '${REMOTE_DIR%/}'"
