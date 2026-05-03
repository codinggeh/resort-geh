#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-resort-geh}"
APP_USER="${APP_USER:-resortgeh}"
APP_GROUP="${APP_GROUP:-$APP_USER}"
APP_DIR="${APP_DIR:-/opt/$APP_NAME/app}"
APP_ROOT="$(dirname "$APP_DIR")"
ENV_FILE="${ENV_FILE:-/etc/$APP_NAME.env}"
NODE_ENV="${NODE_ENV:-production}"
PORT="${PORT:-3010}"
DOMAIN="${DOMAIN:-demo-resort-geh.codinggeh.com}"

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y ca-certificates curl gnupg rsync nginx certbot python3-certbot-nginx build-essential

if ! command -v node >/dev/null 2>&1 || ! node -v | grep -q '^v22\.'; then
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  chmod 0644 /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
  apt-get update
  apt-get install -y nodejs
fi

if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir "$APP_ROOT" --shell /usr/sbin/nologin "$APP_USER"
fi

mkdir -p "$APP_ROOT"
chown -R "$APP_USER:$APP_GROUP" "$APP_ROOT"

mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_GROUP" "$APP_ROOT"

if [ ! -f "$ENV_FILE" ]; then
  touch "$ENV_FILE"
fi
chown root:"$APP_GROUP" "$ENV_FILE"
chmod 640 "$ENV_FILE"

awk -v app_name="$APP_NAME" -v app_dir="$APP_DIR" -v env_file="$ENV_FILE" -v port="$PORT" -v app_user="$APP_USER" 'BEGIN {
print "[Unit]"
print "Description=" app_name " Next.js app"
print "After=network.target"
print ""
print "[Service]"
print "Type=simple"
print "User=" app_user
print "Group=" app_user
print "WorkingDirectory=" app_dir
print "Environment=NODE_ENV=production"
print "Environment=PORT=" port
print "EnvironmentFile=" env_file
print "ExecStart=/usr/bin/npm run start -- --hostname 127.0.0.1 --port " port
print "Restart=always"
print "RestartSec=5"
print "TimeoutStartSec=120"
print ""
print "[Install]"
print "WantedBy=multi-user.target"
}' > "/etc/systemd/system/${APP_NAME}.service"

cat > "/etc/nginx/sites-available/${DOMAIN}" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    client_max_body_size 10m;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass \$http_upgrade;
        proxy_redirect ~^http://([^/]+):${PORT}(/.*)$ http://\$1\$2;
        proxy_pass http://127.0.0.1:${PORT};
    }
}
NGINX

ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
nginx -t
systemctl daemon-reload
systemctl enable nginx
systemctl enable "$APP_NAME"
