import test from "node:test"
import assert from "node:assert/strict"
import { createRoomState, reduceGame } from "../gameReducer.js"

test("host can start a round after players are ready", () => {
  const room = createRoomState("ABC123", "Host", "host-token")
  room.players.push({
    id: "player-2",
    token: "player-token",
    name: "Guest",
    connected: true,
    ready: false,
    isHost: false,
    cards: [],
    knownToSelf: [],
    score: 0,
  })

  reduceGame(room, { type: "SET_READY", playerId: "player-2", ready: true })
  reduceGame(room, { type: "START_GAME", playerId: room.players[0].id })

  assert.equal(room.phase, "playing")
  assert.equal(room.players[0].cards.length, 4)
  assert.equal(room.players[1].cards.length, 4)
  assert.equal(room.discard.length, 1)
})

test("drawing from discard forces a swap", () => {
  const room = createRoomState("ABC123", "Host", "host-token")
  room.players.push({
    id: "player-2",
    token: "player-token",
    name: "Guest",
    connected: true,
    ready: true,
    isHost: false,
    cards: [],
    knownToSelf: [],
    score: 0,
  })

  reduceGame(room, { type: "START_GAME", playerId: room.players[0].id })
  reduceGame(room, { type: "DRAW_FROM_DISCARD", playerId: room.players[0].id })

  assert.equal(room.pendingDraw?.mustSwap, true)
})
