import ActionBar from "./ActionBar"
import CardVisual from "./CardVisual"
import type { RoomView } from "../types"

type Props = {
  room: RoomView
  onSwap: (index: number) => void
  onSlap: (index: number) => void
  onDrawDeck: () => void
  onTakeDiscard: () => void
  onDiscardDraw: () => void
  onCallCabo: () => void
}

const SelfHand = ({ room, onSwap, onSlap, onDrawDeck, onTakeDiscard, onDiscardDraw, onCallCabo }: Props) => {
  const selfPlayer = room.players.find((player) => player.id === room.selfPlayerId)
  const isSelfTurn = room.turnPlayerId === room.selfPlayerId

  if (!selfPlayer) return null

  return (
    <section className="self-hand">
      <div className="self-status">
        <span>{selfPlayer.name}</span>
        {room.roundResult && <strong>+{room.roundResult.deltas[selfPlayer.id] ?? 0}</strong>}
      </div>

      <div className={`seat seat-self ${isSelfTurn ? "is-current-turn" : ""} ${room.caboCallerId === selfPlayer.id ? "is-cabo-caller" : ""}`}>
        <div className="seat-header">
          <div>
            <h3>{selfPlayer.name}</h3>
            <p>{selfPlayer.connected ? "Connected" : "Reconnecting"}</p>
          </div>
          <div className="score-pill">{selfPlayer.score}</div>
        </div>
        <div className={`seat-cards ${room.phase !== "playing" ? "is-round-reveal" : ""}`}>
          {selfPlayer.cards.map((card, cardIndex) => (
            <button
              className="card-slot is-self"
              key={card.id}
              type="button"
              onClick={() => {
                if (room.pendingDraw) onSwap(cardIndex)
                else if (room.settings.slapEnabled) onSlap(cardIndex)
              }}
            >
              <CardVisual
                card={card}
                interactive
                dimmed={false}
                className={room.pendingDraw ? "is-swap-target" : ""}
              />
            </button>
          ))}
        </div>
      </div>

      <ActionBar
        canDraw={isSelfTurn && !room.pendingDraw}
        hasPendingDraw={Boolean(isSelfTurn && room.pendingDraw && room.pendingDraw.source === "deck")}
        canTakeDiscard={isSelfTurn && !room.pendingDraw}
        onDrawDeck={onDrawDeck}
        onTakeDiscard={onTakeDiscard}
        onDiscardDraw={onDiscardDraw}
        onCallCabo={onCallCabo}
      />
    </section>
  )
}

export default SelfHand
