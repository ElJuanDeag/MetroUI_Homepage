import type { CSSProperties } from "react"
import type { RoomView } from "../types"
import CardVisual from "./CardVisual"

type Props = {
  room: RoomView
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

const PlayerGrid = ({ room }: Props) => {
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

        return (
          <section
            className={`seat seat-${seat} ${isCurrentTurn ? "is-current-turn" : ""} ${isCaboCaller ? "is-cabo-caller" : ""}`}
            key={player.id}
            style={
              {
                "--seat-x": coordinates.x,
                "--seat-y": coordinates.y,
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
                  className="card-slot"
                  key={card.id}
                  type="button"
                  onClick={undefined}
                  disabled
                >
                  <CardVisual
                    card={card}
                    interactive={false}
                    dimmed={Boolean(room.pendingDraw)}
                    className=""
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
