import type { PlayerState, RoundResult, RoomState } from "../shared/game.js"

const totalPlayerCards = (player: PlayerState) => player.cards.reduce((sum, card) => sum + card.value, 0)

export function scoreRound(room: RoomState): RoundResult {
  const totals = Object.fromEntries(room.players.map((player) => [player.id, totalPlayerCards(player)]))
  const lowest = Math.min(...Object.values(totals))
  const winnerIds = Object.entries(totals)
    .filter(([, total]) => total === lowest)
    .map(([playerId]) => playerId)

  const deltas: Record<string, number> = {}
  for (const player of room.players) {
    let delta = totals[player.id]
    if (room.caboCallerId === player.id && !winnerIds.includes(player.id)) {
      delta += room.settings.caboPenalty
    }
    deltas[player.id] = delta
  }

  return {
    winnerIds,
    deltas,
    totals,
    caboCallerId: room.caboCallerId,
  }
}

export function applyRoundScores(room: RoomState, result: RoundResult) {
  room.players = room.players.map((player) => ({
    ...player,
    score: player.score + result.deltas[player.id],
  }))
}

export function hasMatchWinner(room: RoomState) {
  return room.players.some((player) => player.score >= room.settings.scoreLimit)
}
