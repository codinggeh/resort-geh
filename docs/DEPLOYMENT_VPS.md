# VPS Deployment

This deployment flow is based on `rsync`, not `git clone`.

Target:
- Domain: `demo-resort-geh.codinggeh.com`
- App port: `3010`
- Service: `resort-geh`
- App dir: `/opt/resort-geh/app`
- Env file: `/etc/resort-geh.env`
- Public locale URLs: `/en/...` and `/id/...`

## 1. Fresh server bootstrap
Copy the bootstrap script to the VPS, then run it as root:

```bash
scp ops/bootstrap-vps.sh root@178.128.57.32:/root/bootstrap-vps.sh
ssh root@178.128.57.32

cd /root
APP_NAME=resort-geh \
APP_USER=resortgeh \
APP_DIR=/opt/resort-geh/app \
PORT=3010 \
DOMAIN=demo-resort-geh.codinggeh.com \
./bootstrap-vps.sh
```

## 2. Production env
Create `/etc/resort-geh.env`:

```env
NEXT_PUBLIC_SITE_URL=https://demo-resort-geh.codinggeh.com
NEXT_PUBLIC_APP_URL=https://demo-resort-geh.codinggeh.com
BETTER_AUTH_URL=https://demo-resort-geh.codinggeh.com
BETTER_AUTH_SECRET=<generate-a-random-secret>
BETTER_AUTH_TRUSTED_ORIGINS=https://demo-resort-geh.codinggeh.com,http://127.0.0.1:3010,http://178.128.57.32
PAKASIR_BASE_URL=https://app.pakasir.com
PAKASIR_PROJECT_SLUG=resort-geh
PAKASIR_API_KEY=<your-pakasir-api-key>
```

Then set file permissions:

```bash
chown root:resortgeh /etc/resort-geh.env
chmod 640 /etc/resort-geh.env
```

## 3. Sync code from local machine
Run from your local machine:

```bash
SERVER=root@178.128.57.32 REMOTE_DIR=/opt/resort-geh/app/ ./ops/sync-to-vps.sh
```

This sync:
- does not copy `.git`
- does not copy `.env.local`
- does not copy `.next` or `node_modules`
- writes remote files as `resortgeh:resortgeh`

## 4. Build and start
Run on the VPS as root:

```bash
cd /opt/resort-geh/app
./ops/deploy-vps.sh
nginx -t
systemctl reload nginx
```

`ops/deploy-vps.sh` intentionally:
- does not run `git pull`
- uses `npm install --package-lock=false` instead of `npm ci`
- runs repo-local DB migration scripts before build
- rebuilds `.next` from scratch
- sources `/etc/resort-geh.env` before install/build
- builds with `NODE_OPTIONS=--max-old-space-size=1024`, which is safer on a 1 GB VPS

## 5. DNS and SSL
Point the A record:
- `demo-resort-geh.codinggeh.com -> 178.128.57.32`

After DNS is live, run:

```bash
cd /opt/resort-geh/app
DOMAIN=demo-resort-geh.codinggeh.com EMAIL=hi@codinggeh.com ./ops/enable-ssl.sh
```

## 6. Later redeploys
1. From local machine:
   `SERVER=root@178.128.57.32 ./ops/sync-to-vps.sh`
2. On VPS:
   `cd /opt/resort-geh/app && ./ops/deploy-vps.sh`

## 7. If server dies
1. Provision Ubuntu VPS
2. Copy this repo to your local machine
3. Copy `ops/bootstrap-vps.sh` to the server and run it
4. Restore `/etc/resort-geh.env`
5. Run `./ops/sync-to-vps.sh` from local machine
6. On VPS run `cd /opt/resort-geh/app && ./ops/deploy-vps.sh`
7. Point DNS A record
8. Run `ops/enable-ssl.sh`

## 8. Verification
```bash
curl -I http://127.0.0.1:3010
curl -I -H 'Host: demo-resort-geh.codinggeh.com' http://127.0.0.1
systemctl status resort-geh --no-pager
journalctl -u resort-geh -n 100 --no-pager
```
