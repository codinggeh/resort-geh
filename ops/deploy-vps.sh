#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-resort-geh}"
APP_USER="${APP_USER:-resortgeh}"
APP_GROUP="${APP_GROUP:-$APP_USER}"
APP_DIR="${APP_DIR:-/opt/$APP_NAME/app}"
ENV_FILE="${ENV_FILE:-/etc/$APP_NAME.env}"
PORT="${PORT:-3010}"
BUILD_NODE_OPTIONS="${BUILD_NODE_OPTIONS:---max-old-space-size=1024}"
RUN_AS_USER=(runuser -u "$APP_USER" --)

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

systemctl stop "$APP_NAME" || true
systemctl reset-failed "$APP_NAME" || true
cd "$APP_DIR"
chown -R "$APP_USER:$APP_GROUP" "$(dirname "$APP_DIR")"
rm -rf .next
mkdir -p .next
chown -R "$APP_USER:$APP_GROUP" .next
"${RUN_AS_USER[@]}" npm install --package-lock=false
"${RUN_AS_USER[@]}" npm run db:migrate:users-password-hash-nullable
"${RUN_AS_USER[@]}" env NODE_OPTIONS="$BUILD_NODE_OPTIONS" npm run build
systemctl start "$APP_NAME"
sleep 3
curl -fsS "http://127.0.0.1:${PORT}" >/dev/null
systemctl --no-pager --full status "$APP_NAME" | sed -n '1,60p'
