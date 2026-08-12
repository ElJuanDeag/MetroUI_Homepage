import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import { applyClientMessage, attachConnection, broadcastRoom, createRoom, detachConnection, getRoom, joinRoom, sweepRooms } from "./rooms.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distClient = path.resolve(__dirname, "../../dist-client");
const port = Number(process.env.PORT || 8080);
const sendJson = (response, statusCode, payload) => {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(payload));
};
const serveStatic = async (requestPath) => {
    const normalized = requestPath === "/" ? "/index.html" : requestPath;
    const filePath = path.join(distClient, normalized);
    await stat(filePath);
    return readFile(filePath);
};
const httpServer = createServer(async (req, res) => {
    try {
        if (req.method === "POST" && req.url === "/api/rooms") {
            const chunks = [];
            for await (const chunk of req)
                chunks.push(Buffer.from(chunk));
            const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            const created = createRoom(payload);
            sendJson(res, 201, {
                roomId: created.roomId,
                inviteUrl: created.inviteUrl,
                playerToken: created.hostToken,
            });
            return;
        }
        if (req.method === "GET" && req.url?.startsWith("/api/rooms/")) {
            const roomId = req.url.split("/").pop()?.toUpperCase();
            const room = roomId ? getRoom(roomId) : undefined;
            if (!room) {
                sendJson(res, 404, { message: "Room not found." });
                return;
            }
            sendJson(res, 200, { roomId: room.room.roomId });
            return;
        }
        const asset = await serveStatic(req.url || "/");
        res.statusCode = 200;
        if ((req.url || "/").endsWith(".js"))
            res.setHeader("Content-Type", "application/javascript");
        if ((req.url || "/").endsWith(".css"))
            res.setHeader("Content-Type", "text/css");
        if ((req.url || "/").endsWith(".html"))
            res.setHeader("Content-Type", "text/html");
        res.end(asset);
    }
    catch {
        try {
            const index = await readFile(path.join(distClient, "index.html"));
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(index);
        }
        catch {
            sendJson(res, 500, { message: "Server error." });
        }
    }
});
const wsServer = new WebSocketServer({ noServer: true });
httpServer.on("upgrade", (request, socket, head) => {
    if (!request.url?.startsWith("/ws")) {
        socket.destroy();
        return;
    }
    wsServer.handleUpgrade(request, socket, head, (websocket) => {
        wsServer.emit("connection", websocket, request);
    });
});
wsServer.on("connection", (socket, request) => {
    let roomId = "";
    let playerId = "";
    const send = (message) => {
        socket.send(JSON.stringify(message));
    };
    socket.on("message", (raw) => {
        try {
            const message = JSON.parse(raw.toString());
            if (message.type === "PING") {
                send({ type: "PONG" });
                return;
            }
            if (message.type === "JOIN_ROOM") {
                roomId = message.roomId.toUpperCase();
                const player = joinRoom(roomId, message.name, message.playerToken);
                playerId = player.id;
                attachConnection(roomId, player.id, { send });
                broadcastRoom(roomId, true);
                return;
            }
            if (!roomId || !playerId)
                throw new Error("Join a room first.");
            applyClientMessage(roomId, playerId, message);
            broadcastRoom(roomId);
        }
        catch (error) {
            send({
                type: "ERROR",
                message: error instanceof Error ? error.message : "Unknown error.",
            });
        }
    });
    socket.on("close", () => {
        if (roomId && playerId) {
            detachConnection(roomId, playerId);
            broadcastRoom(roomId);
        }
    });
});
setInterval(sweepRooms, 30_000).unref();
httpServer.listen(port, () => {
    console.log(`Cabo server listening on :${port}`);
});
