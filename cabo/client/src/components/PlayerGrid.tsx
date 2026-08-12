import type { RoomView } from "../types"

type Props = {
  room: RoomView
  onSwap: (index: number) => void
  onSlap: (index: number) => void
}

const PlayerGrid = ({ room, onSwap, onSlap }: Props) => (
  <div className="player-grid">
    {room.players.map((player) => (
      <section className="panel" key={player.id}>
        <div className="panel-header">
          <h3>{player.name}</h3>
          <span>{player.score} pts</span>
        </div>
        <div className="cards-grid">
          {player.cards.map((card, index) => (
            <button
              className={`card-slot ${room.selfPlayerId === player.id ? "is-actionable" : ""}`}
              key={card.id}
              type="button"
              onClick={() => {
                if (room.selfPlayerId === player.id && room.pendingDraw) onSwap(index)
                if (room.selfPlayerId === player.id && room.settings.slapEnabled) onSlap(index)
              }}
            >
              {card.kind === "visible" ? `${card.rank} ${card.suit}` : "Hidden"}
            </button>
          ))}
        </div>
      </section>
    ))}
  </div>
)

export default PlayerGrid
