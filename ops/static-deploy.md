# Static Deploy (Vite) - MetroUI_Website

This document describes how to build the frontend locally and deploy the `dist/` output to your phone (Termux + nginx + cloudflared). It includes a manual workflow and an optional GitHub Actions example.

Prerequisites
- Node.js (on dev machine)
- SSH access to phone (username, host, port)
- nginx root on phone (example: `/data/data/com.termux/files/home/www/metro`)
- `cloudflared` configured to forward public hostname to the phone's `127.0.0.1:8080` (nginx)

Local build (dev machine)
```bash
# from repo root
npm ci
npm run build
# built files are in `dist/`
```

Manual deploy (rsync, recommended)
```bash
# replace variables
DEST_USER=username
DEST_HOST=192.168.1.7
DEST_PORT=8022
DEST_PATH=/data/data/com.termux/files/home/www/metro

rsync -avz -e "ssh -p $DEST_PORT" --delete dist/ ${DEST_USER}@${DEST_HOST}:${DEST_PATH}/
```

Manual deploy (scp)
```bash
scp -P 8022 -r dist/* username@192.168.1.7:/data/data/com.termux/files/home/www/metro/
```

Git pull on device (alternate)
```bash
# on phone
cd /data/data/com.termux/files/home/metro    # repo clone path
git fetch --all
git reset --hard origin/main
npm ci && npm run build    # optional: build on device
rsync -av --delete dist/ /data/data/com.termux/files/home/www/metro/
```

Health check
```bash
curl -I http://127.0.0.1:8080/    # when on-device
curl -I https://metro.example.com/ # public via cloudflared
```

Permissions & nginx notes
- Ensure files in web root are readable by nginx user.
- Keep nginx bound to `127.0.0.1:8080` and expose only via `cloudflared`.

Backup
- Keep a simple nightly copy of the web root or the repo `dist/` build artifacts.

GitHub Actions (optional) - build & rsync
```yaml
name: Build & Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: '18'}
      - run: npm ci && npm run build
      - name: Deploy via rsync
        env:
          SSH_PRIVATE_KEY: ${{ secrets.DEPLOY_KEY }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          rsync -avz -e "ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no -p ${{ secrets.DEPLOY_PORT }}" dist/ ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }}:${{ secrets.DEPLOY_PATH }}
```

Secrets to set in GitHub repo: `DEPLOY_KEY` (private key), `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`, `DEPLOY_PORT`.

Troubleshooting
- If files are not visible, check nginx error logs and permissions.
- If cloudflared reports ingress errors, confirm `config.yml` and credentials are on the phone.

That's it - tell me if you want me to add the Actions workflow file or run a local build now.
