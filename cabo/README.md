# Cabo for play.braje.sh

Standalone Vite + React + TypeScript client plus a lightweight Node WebSocket server for networked Cabo.

## What is included

- `client/`: single-purpose UI for landing, lobby, invite flow, and in-game controls
- `server/`: HTTP + WebSocket server, in-memory room/session management, reconnect grace handling
- `shared/`: message contracts and room/game types shared by both sides
- `Dockerfile`: single-container deployment that serves the built frontend and upgrades `/ws`

## Local development

```bash
npm install
npm run dev
npm run dev:server
```

The client expects the same origin in production. In local development, run the Vite client and the Node server separately.

## Deploy shape

1. Build the image from this repo.
2. Run one container, for example `cabo-app`, with `restart: unless-stopped`.
3. Point Nginx Proxy Manager at the container and enable WebSocket support for `play.braje.sh`.
4. Add a Cloudflare Tunnel public hostname for `play.braje.sh` on tunnel `a1e4c810-ec43-4ee8-a001-623caedcc434`.

## Notes

- Room state is intentionally in-memory for v1.
- Reconnection keeps a player's seat warm for 90 seconds.
- The reducer/pure game logic is isolated in `server/gameReducer.ts` for testability.
