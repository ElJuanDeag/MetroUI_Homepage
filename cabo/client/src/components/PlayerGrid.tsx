import type { CSSProperties } from "react"
import type { RoomView } from "../types"
import CardVisual from "./CardVisual"

type Props = {
  room: RoomView
  onSwap: (index: number) => void
  onSlap: (index: number) => void
}

const positionOrder = (totalPlayers: number) => {
  if (totalPlayers === 2) return ["south", "north"] as const
  if (totalPlayers === 3) return ["south", "west", "north"] as const
  return ["south", "west", "north", "east"] as const
}

const seatCoordinates = (seat: ReturnType<typeof positionOrder>[number], totalPlayers: number) => {
  if (totalPlayers === 2) {
    return seat === "south" ? { x: "50%", y: "79%" } : { x: "50%", y: "20%" }
  }

  if (totalPlayers === 3) {
    if (seat === "south") return { x: "50%", y: "80%" }
    if (seat === "west") return { x: "20%", y: "31%" }
    return { x: "50%", y: "18%" }
  }

  if (seat === "south") return { x: "50%", y: "80%" }
  if (seat === "west") return { x: "18%", y: "48%" }
  if (seat === "east") return { x: "82%", y: "48%" }
  return { x: "50%", y: "18%" }
}

const PlayerGrid = ({ room, onSwap, onSlap }: Props) => {
  const selfIndex = room.players.findIndex((player) => player.id === room.selfPlayerId)
  const orderedPlayers = room.players.map((_, index) => room.players[(selfIndex + index + room.players.length) % room.players.length])
  const positions = positionOrder(orderedPlayers.length)

  return (
    <div className={`table-seats seats-${orderedPlayers.length}`}>
      {orderedPlayers.map((player, index) => {
        const isSelf = room.selfPlayerId === player.id
        const isCurrentTurn = room.turnPlayerId === player.id
        const isCaboCaller = room.caboCallerId === player.id

        return (
          <section
            className={`seat seat-${positions[index]} ${isCurrentTurn ? "is-current-turn" : ""} ${isCaboCaller ? "is-cabo-caller" : ""}`}
            key={player.id}
            style={
              {
                "--seat-x": seatCoordinates(positions[index], orderedPlayers.length).x,
                "--seat-y": seatCoordinates(positions[index], orderedPlayers.length).y,
              } as CSSProperties
            }
          >
            <div className="seat-header">
              <div>
                <h3>{player.name}</h3>
                <p>{player.connected ? "Connected" : "Reconnecting"}</p>
              </div>
              <div className="score-pill">{player.score}</div>
            </div>
            <div className={`seat-cards ${room.phase !== "playing" ? "is-round-reveal" : ""}`}>
              {player.cards.map((card, cardIndex) => (
                <button
                  className={`card-slot ${isSelf ? "is-self" : ""}`}
                  key={card.id}
                  type="button"
                  onClick={() => {
                    if (isSelf && room.pendingDraw) onSwap(cardIndex)
                    else if (isSelf && room.settings.slapEnabled) onSlap(cardIndex)
                  }}
                >
                  <CardVisual
                    card={card}
                    interactive={isSelf}
                    dimmed={Boolean(room.pendingDraw) && !isSelf}
                    className={room.pendingDraw && isSelf ? "is-swap-target" : ""}
                  />
                </button>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default PlayerGrid
