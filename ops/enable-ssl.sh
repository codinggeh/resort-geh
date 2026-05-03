#!/usr/bin/env bash
set -euo pipefail
DOMAIN="${DOMAIN:-demo-resort-geh.codinggeh.com}"
EMAIL="${EMAIL:-hi@codinggeh.com}"
certbot --nginx -d "$DOMAIN" --redirect -m "$EMAIL" --agree-tos --no-eff-email
nginx -t
systemctl reload nginx
