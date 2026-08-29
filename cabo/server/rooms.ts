import type { CreateRoomRequest, CreateRoomResponse } from "../shared/messages.js"
import type { ClientMessage, ServerMessage } from "../shared/messages.js"
import type { RoomState, RoomView } from "../shared/game.js"
import { createRoomState, endPeekPhase, finalizePeekPower, reduceGame } from "./gameReducer.js"

type Connection = {
  send: (message: ServerMessage) => void
}

type Session = {
  room: RoomState
  connections: Map<string, Connection>
  slapQueue: ClientMessage[]
  peekTimeout?: ReturnType<typeof setTimeout>
  powerTimeout?: ReturnType<typeof setTimeout>
}

const ROOM_TTL_MS = 1000 * 60 * 30
const RECONNECT_GRACE_MS = 1000 * 90
const rooms = new Map<string, Session>()

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

const randomToken = () => crypto.randomUUID()

const randomRoomId = () =>
  Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")

export const createRoom = (request: CreateRoomRequest): CreateRoomResponse & { hostToken: string } => {
  let roomId = randomRoomId()
  while (rooms.has(roomId)) roomId = randomRoomId()
  const hostToken = randomToken()
  const room = createRoomState(roomId, request.hostName, hostToken, request.settings)
  rooms.set(roomId, {
    room,
    connections: new Map(),
    slapQueue: [],
  })
  return {
    roomId,
    inviteUrl: `https://play.braje.sh?room=${roomId}`,
    hostToken,
  }
}

export const getRoom = (roomId: string) => rooms.get(roomId)

export const joinRoom = (roomId: string, name: string, playerToken?: string) => {
  const session = rooms.get(roomId)
  if (!session) throw new Error("Room not found.")

  const reconnecting = playerToken
    ? session.room.players.find((player) => player.token === playerToken)
    : undefined

  if (reconnecting) {
    reconnecting.connected = true
    reconnecting.disconnectedAt = undefined
    return reconnecting
  }

  if (session.room.phase !== "lobby") throw new Error("Game already started.")
  if (session.room.players.length >= 4) throw new Error("Room is full.")

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
  }
  session.room.players.push(player)
  session.room.updatedAt = Date.now()
  session.room.messageLog.push(`${name} joined the room.`)
  return player
}

const cardForViewer = (viewerId: string | undefined, room: RoomState, ownerId: string, cardId: string) => {
  const owner = room.players.find((player) => player.id === ownerId)
  const card = owner?.cards.find((entry) => entry.id === cardId)
  if (!card) return { kind: "hidden" as const, id: cardId }

  const transientRevealTargets = (() => {
    if (!room.pendingPower || viewerId !== room.pendingPower.actorId) return []
    if (room.pendingPower.type === "blind-swap") {
      return room.pendingPower.first ? [room.pendingPower.first] : []
    }
    if (room.pendingPower.type === "king") {
      return [room.pendingPower.first].filter((target): target is NonNullable<typeof room.pendingPower.first> => Boolean(target))
    }
    return []
  })()

  const isTransientlyVisible = transientRevealTargets.some((target) => {
    if (target.playerId !== ownerId) return false
    return owner?.cards[target.cardIndex]?.id === cardId
  })

  const visibleToViewer =
    room.revealAll ||
    isTransientlyVisible ||
    viewerId === ownerId && owner?.knownToSelf.includes(cardId)

  if (!visibleToViewer) {
    return { kind: "hidden" as const, id: card.id }
  }

  return {
    kind: "visible" as const,
    id: card.id,
    rank: card.rank,
    suit: card.suit,
    value: card.value,
  }
}

const schedulePeekTransition = (roomId: string) => {
  const session = rooms.get(roomId)
  if (!session) return

  if (session.peekTimeout) {
    clearTimeout(session.peekTimeout)
    session.peekTimeout = undefined
  }

  if (session.room.phase !== "peek" || !session.room.peekPhaseEndsAt) return

  const delay = Math.max(0, session.room.peekPhaseEndsAt - Date.now())
  session.peekTimeout = setTimeout(() => {
    const activeSession = rooms.get(roomId)
    if (!activeSession) return
    endPeekPhase(activeSession.room)
    broadcastRoom(roomId)
    activeSession.peekTimeout = undefined
  }, delay)
  session.peekTimeout.unref()
}

const schedulePowerTransition = (roomId: string) => {
  const session = rooms.get(roomId)
  if (!session) return

  if (session.powerTimeout) {
    clearTimeout(session.powerTimeout)
    session.powerTimeout = undefined
  }

  const pendingPower = session.room.pendingPower
  if (!pendingPower || (pendingPower.type !== "peek-self" && pendingPower.type !== "peek-opponent") || !pendingPower.first) {
    return
  }

  session.powerTimeout = setTimeout(() => {
    const activeSession = rooms.get(roomId)
    if (!activeSession) return
    finalizePeekPower(activeSession.room)
    broadcastRoom(roomId)
    activeSession.powerTimeout = undefined
  }, 2_500)
  session.powerTimeout.unref()
}

const syncTimedState = (roomId: string) => {
  const session = rooms.get(roomId)
  if (!session) return

  if (session.room.phase === "peek" && session.room.peekPhaseEndsAt && Date.now() >= session.room.peekPhaseEndsAt) {
    endPeekPhase(session.room)
  }

  schedulePeekTransition(roomId)
  schedulePowerTransition(roomId)
}

export const buildRoomView = (room: RoomState, viewerId?: string): RoomView => ({
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
  pendingDraw:
    room.pendingDraw && viewerId === room.turnPlayerId
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
  peekPhaseEndsAt: room.peekPhaseEndsAt,
  turnStartedAt: room.turnStartedAt,
  discardLandedAt: room.discardLandedAt,
  messageLog: room.messageLog,
  roundResult: room.roundResult,
})

export const attachConnection = (roomId: string, playerId: string, connection: Connection) => {
  const session = rooms.get(roomId)
  if (!session) return
  session.connections.set(playerId, connection)
}

export const detachConnection = (roomId: string, playerId: string) => {
  const session = rooms.get(roomId)
  if (!session) return
  session.connections.delete(playerId)
  const player = session.room.players.find((entry) => entry.id === playerId)
  if (player) {
    player.connected = false
    player.disconnectedAt = Date.now()
  }
}

export const broadcastRoom = (roomId: string, includeTokens = false) => {
  const session = rooms.get(roomId)
  if (!session) return
  syncTimedState(roomId)
  for (const player of session.room.players) {
    const connection = session.connections.get(player.id)
    if (!connection) continue
    connection.send({
      type: "ROOM_STATE",
      room: buildRoomView(session.room, player.id),
      playerToken: includeTokens ? player.token : undefined,
    })
  }
}

export const applyClientMessage = (roomId: string, playerId: string, message: ClientMessage) => {
  const session = rooms.get(roomId)
  if (!session) throw new Error("Room not found.")
  syncTimedState(roomId)

  if (message.type === "SLAP_DISCARD") {
    session.slapQueue.push(message)
    const queued = session.slapQueue.shift()
    if (queued?.type === "SLAP_DISCARD") {
      reduceGame(session.room, {
        type: "SLAP_DISCARD",
        playerId,
        cardIndex: queued.cardIndex,
      })
    }
    return session.room
  }

  switch (message.type) {
    case "SET_READY":
      return reduceGame(session.room, { type: "SET_READY", playerId, ready: message.ready })
    case "START_GAME":
      return reduceGame(session.room, { type: "START_GAME", playerId })
    case "DRAW_FROM_DECK":
      return reduceGame(session.room, { type: "DRAW_FROM_DECK", playerId })
    case "DRAW_FROM_DISCARD":
      return reduceGame(session.room, { type: "DRAW_FROM_DISCARD", playerId })
    case "SWAP_DRAWN_CARD":
      return reduceGame(session.room, { type: "SWAP_DRAWN_CARD", playerId, cardIndex: message.cardIndex })
    case "DISCARD_DRAWN_CARD":
      return reduceGame(session.room, { type: "DISCARD_DRAWN_CARD", playerId })
    case "RESOLVE_POWER":
      return reduceGame(session.room, {
        type: "RESOLVE_POWER",
        playerId,
        first: message.first,
        second: message.second,
        swap: message.swap,
      })
    case "CALL_CABO":
      return reduceGame(session.room, { type: "CALL_CABO", playerId })
    default:
      return session.room
  }
}

export const sweepRooms = () => {
  const now = Date.now()
  for (const [roomId, session] of rooms.entries()) {
    session.room.players = session.room.players.filter((player) => {
      if (player.connected) return true
      if (!player.disconnectedAt) return true
      return now - player.disconnectedAt < RECONNECT_GRACE_MS
    })

    if (
      session.connections.size === 0 &&
      now - session.room.updatedAt > ROOM_TTL_MS
    ) {
      if (session.peekTimeout) clearTimeout(session.peekTimeout)
      if (session.powerTimeout) clearTimeout(session.powerTimeout)
      rooms.delete(roomId)
    }
  }
}
