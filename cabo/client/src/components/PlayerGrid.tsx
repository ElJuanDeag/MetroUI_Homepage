import type { CSSProperties } from "react"
import type { PublicCardView, RoomView, TargetCard } from "../types"
import CardVisual from "./CardVisual"

type Props = {
  room: RoomView
  onSelectPowerTarget: (target: TargetCard) => void
  isKingSwapArmed?: boolean
  now: number
  maskCard: (card: PublicCardView) => PublicCardView
}

const positionOrder = (totalPlayers: number) => {
  if (totalPlayers === 2) return ["south", "north"] as const
  if (totalPlayers === 3) return ["south", "west", "north"] as const
  return ["south", "west", "north", "east"] as const
}

const seatCoordinates = (index: number, opponentCount: number) => {
  if (opponentCount <= 1) return { x: "50%", y: "16%" }

  if (opponentCount === 2) {
    return { x: index === 0 ? "22%" : "78%", y: "20%" }
  }

  const columns = ["18%", "50%", "82%"]
  return { x: columns[index] ?? "50%", y: index === 1 ? "14%" : "22%" }
}

const isPowerTarget = (room: RoomView, playerId: string, cardIndex: number, isKingSwapArmed = false) => {
  const pendingPower = room.pendingPower
  if (!pendingPower) return false

  if (pendingPower.type === "peek-self") return playerId === pendingPower.actorId
  if (pendingPower.type === "peek-opponent") return playerId !== pendingPower.actorId
  if (pendingPower.type === "blind-swap") return true
  if (pendingPower.type === "king" && pendingPower.hasPeeked) {
    if (!isKingSwapArmed) return false
    return !(
      pendingPower.first?.playerId === playerId &&
      pendingPower.first.cardIndex === cardIndex
    )
  }

  return true
}

const PlayerGrid = ({ room, onSelectPowerTarget, isKingSwapArmed = false, now, maskCard }: Props) => {
  const selfIndex = room.players.findIndex((player) => player.id === room.selfPlayerId)
  const orderedPlayers = room.players.map((_, index) => room.players[(selfIndex + index + room.players.length) % room.players.length])
  const positions = positionOrder(orderedPlayers.length)
  const opponentSeats = orderedPlayers
    .map((player, index) => ({ player, seat: positions[index] }))
    .filter(({ player }) => player.id !== room.selfPlayerId)

  return (
    <div className={`table-seats seats-${opponentSeats.length}`}>
      {opponentSeats.map(({ player, seat }, index) => {
        const isCurrentTurn = room.turnPlayerId === player.id
        const isCaboCaller = room.caboCallerId === player.id
        const coordinates = seatCoordinates(index, opponentSeats.length)
        const turnRemaining = room.turnStartedAt && isCurrentTurn ? Math.max(0, 15_000 - (now - room.turnStartedAt)) : 0
        const turnProgress = room.turnStartedAt && isCurrentTurn ? Math.max(0, Math.min(1, turnRemaining / 15_000)) : 0
        const isThinking = room.turnPlayerId === player.id && Boolean(room.pendingDraw)

        return (
          <section
            className={`seat seat-${seat} ${isCurrentTurn ? "is-current-turn" : ""} ${isCaboCaller ? "is-cabo-caller" : ""} ${isThinking ? "is-thinking" : ""}`}
            key={player.id}
            style={
              {
                "--seat-x": coordinates.x,
                "--seat-y": coordinates.y,
                "--turn-progress": `${turnProgress}`,
                "--seat-reveal-delay": `${index * 120}ms`,
              } as CSSProperties
            }
          >
            <div className="seat-header">
              <div>
                <h3>{player.name}</h3>
                <p>{player.connected ? "Connected" : "Reconnecting"}</p>
              </div>
              {isCurrentTurn && <div className="turn-meter" aria-hidden="true" />}
              <div className="score-pill">{player.score}</div>
            </div>
            <div className={`seat-cards ${room.phase !== "playing" ? "is-round-reveal" : ""}`}>
              {player.cards.map((card, cardIndex) => {
                const powerTarget = isPowerTarget(room, player.id, cardIndex, isKingSwapArmed)
                return (
                <button
                  className={`card-slot ${room.pendingPower ? (powerTarget ? "is-power-target" : "is-power-locked") : ""}`.trim()}
                  key={`${player.id}-${cardIndex}`}
                  type="button"
                  onClick={() => {
                    if (room.pendingPower && powerTarget) {
                      onSelectPowerTarget({ playerId: player.id, cardIndex })
                    }
                  }}
                  disabled={Boolean(room.pendingPower) && !powerTarget}
                >
                  <CardVisual
                    card={maskCard(card)}
                    interactive={Boolean(room.pendingPower) && powerTarget}
                    dimmed={Boolean(room.pendingDraw) || (Boolean(room.pendingPower) && !powerTarget)}
                    className={room.pendingPower && powerTarget ? "is-power-target" : ""}
                  />
                </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default PlayerGrid
