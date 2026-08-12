import { createRoomState, reduceGame } from "./gameReducer.js";
const ROOM_TTL_MS = 1000 * 60 * 30;
const RECONNECT_GRACE_MS = 1000 * 90;
const rooms = new Map();
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const randomToken = () => crypto.randomUUID();
const randomRoomId = () => Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
export const createRoom = (request) => {
    let roomId = randomRoomId();
    while (rooms.has(roomId))
        roomId = randomRoomId();
    const hostToken = randomToken();
    const room = createRoomState(roomId, request.hostName, hostToken, request.settings);
    rooms.set(roomId, {
        room,
        connections: new Map(),
        slapQueue: [],
    });
    return {
        roomId,
        inviteUrl: `https://play.braje.sh?room=${roomId}`,
        hostToken,
    };
};
export const getRoom = (roomId) => rooms.get(roomId);
export const joinRoom = (roomId, name, playerToken) => {
    const session = rooms.get(roomId);
    if (!session)
        throw new Error("Room not found.");
    const reconnecting = playerToken
        ? session.room.players.find((player) => player.token === playerToken)
        : undefined;
    if (reconnecting) {
        reconnecting.connected = true;
        reconnecting.disconnectedAt = undefined;
        return reconnecting;
    }
    if (session.room.phase !== "lobby")
        throw new Error("Game already started.");
    if (session.room.players.length >= 4)
        throw new Error("Room is full.");
    const player = {
        id: `player-${Math.random().toString(36).slice(2, 8)}`,
        token: randomToken(),
        name,
        connected: true,
        ready: false,
        isHost: false,
        cards: [],
        knownToSelf: [],
        score: 0,
    };
    session.room.players.push(player);
    session.room.updatedAt = Date.now();
    session.room.messageLog.push(`${name} joined the room.`);
    return player;
};
const cardForViewer = (viewerId, room, ownerId, cardId) => {
    const owner = room.players.find((player) => player.id === ownerId);
    const card = owner?.cards.find((entry) => entry.id === cardId);
    if (!card)
        return { kind: "hidden", id: cardId };
    const visibleToViewer = room.revealAll ||
        viewerId === ownerId && owner?.knownToSelf.includes(cardId);
    if (!visibleToViewer) {
        return { kind: "hidden", id: card.id };
    }
    return {
        kind: "visible",
        id: card.id,
        rank: card.rank,
        suit: card.suit,
        value: card.value,
    };
};
export const buildRoomView = (room, viewerId) => ({
    roomId: room.roomId,
    phase: room.phase,
    settings: room.settings,
    players: room.players.map((player) => ({
        id: player.id,
        name: player.name,
        ready: player.ready,
        connected: player.connected,
        isHost: player.isHost,
        score: player.score,
        cards: player.cards.map((card) => cardForViewer(viewerId, room, player.id, card.id)),
        cardCount: player.cards.length,
    })),
    selfPlayerId: viewerId,
    turnPlayerId: room.turnPlayerId,
    topDiscard: room.discard.length
        ? {
            kind: "visible",
            id: room.discard[room.discard.length - 1].id,
            rank: room.discard[room.discard.length - 1].rank,
            suit: room.discard[room.discard.length - 1].suit,
            value: room.discard[room.discard.length - 1].value,
        }
        : undefined,
    deckCount: room.deck.length,
    pendingDraw: room.pendingDraw && viewerId === room.turnPlayerId
        ? {
            source: room.pendingDraw.source,
            mustSwap: room.pendingDraw.mustSwap,
            card: {
                kind: "visible",
                id: room.pendingDraw.card.id,
                rank: room.pendingDraw.card.rank,
                suit: room.pendingDraw.card.suit,
                value: room.pendingDraw.card.value,
            },
        }
        : room.pendingDraw
            ? {
                source: room.pendingDraw.source,
                mustSwap: room.pendingDraw.mustSwap,
            }
            : undefined,
    pendingPower: room.pendingPower,
    caboCallerId: room.caboCallerId,
    finalTurnsRemaining: room.finalTurnsRemaining,
    round: room.round,
    messageLog: room.messageLog,
    roundResult: room.roundResult,
});
export const attachConnection = (roomId, playerId, connection) => {
    const session = rooms.get(roomId);
    if (!session)
        return;
    session.connections.set(playerId, connection);
};
export const detachConnection = (roomId, playerId) => {
    const session = rooms.get(roomId);
    if (!session)
        return;
    session.connections.delete(playerId);
    const player = session.room.players.find((entry) => entry.id === playerId);
    if (player) {
        player.connected = false;
        player.disconnectedAt = Date.now();
    }
};
export const broadcastRoom = (roomId, includeTokens = false) => {
    const session = rooms.get(roomId);
    if (!session)
        return;
    for (const player of session.room.players) {
        const connection = session.connections.get(player.id);
        if (!connection)
            continue;
        connection.send({
            type: "ROOM_STATE",
            room: buildRoomView(session.room, player.id),
            playerToken: includeTokens ? player.token : undefined,
        });
    }
};
export const applyClientMessage = (roomId, playerId, message) => {
    const session = rooms.get(roomId);
    if (!session)
        throw new Error("Room not found.");
    if (message.type === "SLAP_DISCARD") {
        session.slapQueue.push(message);
        const queued = session.slapQueue.shift();
        if (queued?.type === "SLAP_DISCARD") {
            reduceGame(session.room, {
                type: "SLAP_DISCARD",
                playerId,
                cardIndex: queued.cardIndex,
            });
        }
        return session.room;
    }
    switch (message.type) {
        case "SET_READY":
            return reduceGame(session.room, { type: "SET_READY", playerId, ready: message.ready });
        case "START_GAME":
            return reduceGame(session.room, { type: "START_GAME", playerId });
        case "DRAW_FROM_DECK":
            return reduceGame(session.room, { type: "DRAW_FROM_DECK", playerId });
        case "DRAW_FROM_DISCARD":
            return reduceGame(session.room, { type: "DRAW_FROM_DISCARD", playerId });
        case "SWAP_DRAWN_CARD":
            return reduceGame(session.room, { type: "SWAP_DRAWN_CARD", playerId, cardIndex: message.cardIndex });
        case "DISCARD_DRAWN_CARD":
            return reduceGame(session.room, { type: "DISCARD_DRAWN_CARD", playerId });
        case "RESOLVE_POWER":
            return reduceGame(session.room, {
                type: "RESOLVE_POWER",
                playerId,
                first: message.first,
                second: message.second,
                swap: message.swap,
            });
        case "CALL_CABO":
            return reduceGame(session.room, { type: "CALL_CABO", playerId });
        default:
            return session.room;
    }
};
export const sweepRooms = () => {
    const now = Date.now();
    for (const [roomId, session] of rooms.entries()) {
        session.room.players = session.room.players.filter((player) => {
            if (player.connected)
                return true;
            if (!player.disconnectedAt)
                return true;
            return now - player.disconnectedAt < RECONNECT_GRACE_MS;
        });
        if (session.connections.size === 0 &&
            now - session.room.updatedAt > ROOM_TTL_MS) {
            rooms.delete(roomId);
        }
    }
};
