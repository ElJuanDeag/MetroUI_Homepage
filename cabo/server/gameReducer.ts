import type {
  Card,
  PendingPower,
  PlayerId,
  PlayerState,
  RoomSettings,
  RoomState,
  TargetCard,
} from "../shared/game.js"
import { createDeck, shuffle } from "./deck.js"
import { applyRoundScores, hasMatchWinner, scoreRound } from "./scoring.js"

export type GameAction =
  | { type: "SET_READY"; playerId: PlayerId; ready: boolean }
  | { type: "START_GAME"; playerId: PlayerId }
  | { type: "DRAW_FROM_DECK"; playerId: PlayerId }
  | { type: "DRAW_FROM_DISCARD"; playerId: PlayerId }
  | { type: "SWAP_DRAWN_CARD"; playerId: PlayerId; cardIndex: number }
  | { type: "DISCARD_DRAWN_CARD"; playerId: PlayerId }
  | { type: "RESOLVE_POWER"; playerId: PlayerId; first?: TargetCard; second?: TargetCard; swap?: boolean }
  | { type: "CALL_CABO"; playerId: PlayerId }
  | { type: "SLAP_DISCARD"; playerId: PlayerId; cardIndex: number }

const defaultSettings: RoomSettings = {
  slapEnabled: true,
  caboPenalty: 5,
  scoreLimit: 100,
}

export function createRoomState(roomId: string, hostName: string, hostToken: string, settings?: Partial<RoomSettings>): RoomState {
  const now = Date.now()
  return {
    roomId,
    phase: "lobby",
    settings: { ...defaultSettings, ...settings },
    players: [
      {
        id: `player-${Math.random().toString(36).slice(2, 8)}`,
        token: hostToken,
        name: hostName,
        connected: true,
        ready: false,
        isHost: true,
        cards: [],
        knownToSelf: [],
        score: 0,
      },
    ],
    deck: [],
    discard: [],
    finalTurnsRemaining: [],
    round: 0,
    revealAll: false,
    createdAt: now,
    updatedAt: now,
    messageLog: ["Room created."],
  }
}

const assertTurn = (room: RoomState, playerId: PlayerId) => {
  if (room.turnPlayerId !== playerId) throw new Error("It is not your turn.")
}

const playerById = (room: RoomState, playerId: PlayerId) => {
  const player = room.players.find((entry) => entry.id === playerId)
  if (!player) throw new Error("Player not found.")
  return player
}

const replacePlayer = (room: RoomState, nextPlayer: PlayerState) => {
  room.players = room.players.map((player) => (player.id === nextPlayer.id ? nextPlayer : player))
}

const nextPlayerId = (room: RoomState, currentId: PlayerId) => {
  const currentIndex = room.players.findIndex((player) => player.id === currentId)
  for (let step = 1; step <= room.players.length; step += 1) {
    const candidate = room.players[(currentIndex + step) % room.players.length]
    if (candidate.cards.length > 0) return candidate.id
  }
  return currentId
}

const drawCard = (room: RoomState): Card => {
  if (room.deck.length === 0) {
    const topDiscard = room.discard.pop()
    if (!topDiscard || room.discard.length === 0) throw new Error("No cards left to draw.")
    room.deck = shuffle(room.discard)
    room.discard = [topDiscard]
  }
  const card = room.deck.pop()
  if (!card) throw new Error("Deck is empty.")
  return card
}

const startRound = (room: RoomState) => {
  const deck = shuffle(createDeck())
  const now = Date.now()
  room.round += 1
  room.phase = "peek"
  room.revealAll = false
  room.pendingDraw = undefined
  room.pendingPower = undefined
  room.caboCallerId = undefined
  room.finalTurnsRemaining = []
  room.peekPhaseEndsAt = now + 6_000
  room.messageLog = [`Round ${room.round} started.`]

  room.players = room.players.map((player) => {
    const cards = deck.splice(0, 4)
    return {
      ...player,
      ready: false,
      cards,
      knownToSelf: cards.slice(2, 4).map((card) => card.id),
    }
  })

  room.deck = deck
  room.discard = [drawCard(room)]
  room.turnPlayerId = room.players[0]?.id
  room.turnStartedAt = now
  room.discardLandedAt = now
}

const addLog = (room: RoomState, message: string) => {
  room.messageLog = [...room.messageLog.slice(-11), message]
}

const advanceTurn = (room: RoomState) => {
  if (!room.turnPlayerId) return
  const now = Date.now()
  const currentId = room.turnPlayerId
  if (room.caboCallerId && room.finalTurnsRemaining.length > 0) {
    room.finalTurnsRemaining = room.finalTurnsRemaining.filter((id) => id !== currentId)
    if (room.finalTurnsRemaining.length === 0) {
      finishRound(room)
      return
    }
  }
  room.turnPlayerId = nextPlayerId(room, currentId)
  room.turnStartedAt = now
}

const finishPeekPower = (room: RoomState) => {
  const pending = room.pendingPower
  if (!pending || (pending.type !== "peek-self" && pending.type !== "peek-opponent")) return
  room.pendingPower = undefined
  advanceTurn(room)
}

const finishRound = (room: RoomState) => {
  room.revealAll = true
  room.phase = "round-end"
  room.pendingDraw = undefined
  room.pendingPower = undefined
  const result = scoreRound(room)
  room.roundResult = result
  applyRoundScores(room, result)
  addLog(room, `Round finished. Winner: ${result.winnerIds.join(", ")}`)
  room.phase = hasMatchWinner(room) ? "match-end" : "round-end"
  room.peekPhaseEndsAt = undefined
}

export const endPeekPhase = (room: RoomState) => {
  if (room.phase !== "peek") return room
  room.phase = "playing"
  room.peekPhaseEndsAt = undefined
  addLog(room, "Memorize phase ended. Play begins.")
  room.updatedAt = Date.now()
  return room
}

export const finalizePeekPower = (room: RoomState) => {
  finishPeekPower(room)
  room.updatedAt = Date.now()
  return room
}

const visibleCard = (player: PlayerState, index: number) => {
  const card = player.cards[index]
  if (!card) throw new Error("Card index out of range.")
  return card
}

const swapCards = (a: PlayerState, aIndex: number, b: PlayerState, bIndex: number) => {
  const aCard = visibleCard(a, aIndex)
  const bCard = visibleCard(b, bIndex)
  a.cards[aIndex] = bCard
  b.cards[bIndex] = aCard
  a.knownToSelf = a.knownToSelf.filter((id) => id !== aCard.id)
  b.knownToSelf = b.knownToSelf.filter((id) => id !== bCard.id)
}

const resolvePowerCard = (room: RoomState, playerId: PlayerId, first?: TargetCard, second?: TargetCard, swap?: boolean) => {
  const pending = room.pendingPower
  if (!pending || pending.actorId !== playerId) throw new Error("No power pending.")
  const actor = playerById(room, playerId)

  if (pending.type === "peek-self") {
    if (!first || first.playerId !== playerId) throw new Error("Choose one of your own cards to peek.")
    const card = visibleCard(actor, first.cardIndex)
    if (!actor.knownToSelf.includes(card.id)) actor.knownToSelf.push(card.id)
    room.pendingPower = { ...pending, first }
    addLog(room, `${actor.name} peeked at one of their cards.`)
    return
  }

  if (pending.type === "peek-opponent") {
    if (!first || first.playerId === playerId) throw new Error("Choose an opponent card to peek.")
    const target = playerById(room, first.playerId)
    const card = visibleCard(target, first.cardIndex)
    if (!actor.knownToSelf.includes(card.id)) actor.knownToSelf.push(card.id)
    room.pendingPower = { ...pending, first }
    addLog(room, `${actor.name} peeked at an opponent card.`)
    return
  }

  if (pending.type === "blind-swap") {
    if (!first || !second) throw new Error("Choose two cards to swap.")
    const firstPlayer = playerById(room, first.playerId)
    const secondPlayer = playerById(room, second.playerId)
    swapCards(firstPlayer, first.cardIndex, secondPlayer, second.cardIndex)
    room.pendingPower = undefined
    addLog(room, `${actor.name} performed a blind swap.`)
    advanceTurn(room)
    return
  }

  if (!first) throw new Error("Choose a card for the king action.")
  const firstPlayer = playerById(room, first.playerId)
  const firstCard = visibleCard(firstPlayer, first.cardIndex)
  if (!pending.hasPeeked) {
    if (!actor.knownToSelf.includes(firstCard.id)) actor.knownToSelf.push(firstCard.id)
    room.pendingPower = { ...pending, first, hasPeeked: true }
    addLog(room, `${actor.name} peeked at a king target.`)
    return
  }
  if (swap && second) {
    const secondPlayer = playerById(room, second.playerId)
    swapCards(firstPlayer, first.cardIndex, secondPlayer, second.cardIndex)
    addLog(room, `${actor.name} used king to swap two cards.`)
  } else {
    addLog(room, `${actor.name} kept the king peek without swapping.`)
  }
  room.pendingPower = undefined
  advanceTurn(room)
}

export function reduceGame(room: RoomState, action: GameAction): RoomState {
  room.updatedAt = Date.now()

  const blockedDuringPeek =
    room.phase === "peek" &&
    action.type !== "SET_READY" &&
    action.type !== "START_GAME"

  if (blockedDuringPeek) {
    throw new Error("Memorize your starting cards first.")
  }

  if (action.type === "SET_READY") {
    const player = playerById(room, action.playerId)
    replacePlayer(room, { ...player, ready: action.ready })
    return room
  }

  if (action.type === "START_GAME") {
    const starter = playerById(room, action.playerId)
    if (!starter.isHost) throw new Error("Only the host can start the game.")
    if (room.players.length < 2 || room.players.length > 4) throw new Error("Cabo requires 2 to 4 players.")
    if (!room.players.every((player) => player.ready || player.id === action.playerId)) {
      throw new Error("All non-host players must be ready.")
    }
    startRound(room)
    return room
  }

  if (action.type === "DRAW_FROM_DECK") {
    assertTurn(room, action.playerId)
    if (room.pendingDraw || room.pendingPower) throw new Error("Finish your current action first.")
    room.pendingDraw = {
      card: drawCard(room),
      source: "deck",
      mustSwap: false,
    }
    addLog(room, `${playerById(room, action.playerId).name} drew from the deck.`)
    return room
  }

  if (action.type === "DRAW_FROM_DISCARD") {
    assertTurn(room, action.playerId)
    if (room.pendingDraw || room.pendingPower) throw new Error("Finish your current action first.")
    const card = room.discard.pop()
    if (!card) throw new Error("Discard pile is empty.")
    room.pendingDraw = {
      card,
      source: "discard",
      mustSwap: true,
    }
    addLog(room, `${playerById(room, action.playerId).name} took the discard.`)
    return room
  }

  if (action.type === "SWAP_DRAWN_CARD") {
    assertTurn(room, action.playerId)
    const draw = room.pendingDraw
    if (!draw) throw new Error("No drawn card to swap.")
    const player = playerById(room, action.playerId)
    const replaced = visibleCard(player, action.cardIndex)
    player.cards[action.cardIndex] = draw.card
    player.knownToSelf = player.knownToSelf.filter((id) => id !== replaced.id)
    room.discard.push(replaced)
    room.discardLandedAt = Date.now()
    room.pendingDraw = undefined
    addLog(room, `${player.name} swapped a card into their grid.`)
    advanceTurn(room)
    return room
  }

  if (action.type === "DISCARD_DRAWN_CARD") {
    assertTurn(room, action.playerId)
    const draw = room.pendingDraw
    if (!draw) throw new Error("No drawn card to discard.")
    if (draw.mustSwap) throw new Error("Discard pile draws must be swapped.")
    room.discard.push(draw.card)
    room.discardLandedAt = Date.now()
    room.pendingDraw = undefined
    const power = draw.card.power
    if (power) {
      room.pendingPower = { type: power, actorId: action.playerId } as PendingPower
      addLog(room, `${playerById(room, action.playerId).name} activated ${power}.`)
    } else {
      advanceTurn(room)
    }
    return room
  }

  if (action.type === "RESOLVE_POWER") {
    resolvePowerCard(room, action.playerId, action.first, action.second, action.swap)
    return room
  }

  if (action.type === "CALL_CABO") {
    assertTurn(room, action.playerId)
    if (room.pendingDraw || room.pendingPower) throw new Error("Finish your active turn before calling Cabo.")
    room.caboCallerId = action.playerId
    room.finalTurnsRemaining = room.players.filter((player) => player.id !== action.playerId).map((player) => player.id)
    addLog(room, `${playerById(room, action.playerId).name} called Cabo.`)
    advanceTurn(room)
    return room
  }

  if (action.type === "SLAP_DISCARD") {
    if (!room.settings.slapEnabled) throw new Error("Slap is disabled for this room.")
    if (!room.discardLandedAt || Date.now() - room.discardLandedAt > 2_000) {
      throw new Error("Too late to slap that discard.")
    }
    const player = playerById(room, action.playerId)
    const topDiscard = room.discard[room.discard.length - 1]
    const target = visibleCard(player, action.cardIndex)
    if (topDiscard && target.value === topDiscard.value) {
      player.cards.splice(action.cardIndex, 1)
      player.knownToSelf = player.knownToSelf.filter((id) => id !== target.id)
      room.discard.push(target)
      room.discardLandedAt = Date.now()
      addLog(room, `${player.name} slapped correctly and removed a card.`)
    } else {
      player.cards.push(drawCard(room))
      addLog(room, `${player.name} slapped incorrectly and took a penalty card.`)
    }
    return room
  }

  return room
}
