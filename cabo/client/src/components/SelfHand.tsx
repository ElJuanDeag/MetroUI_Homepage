import type { CSSProperties } from "react"
import ActionBar from "./ActionBar"
import CardVisual from "./CardVisual"
import type { PublicCardView, RoomView, TargetCard } from "../types"

type Props = {
  room: RoomView
  onSwap: (index: number) => void
  onSlap: (index: number) => void
  onSelectPowerTarget: (target: TargetCard) => void
  onDrawDeck: () => void
  onTakeDiscard: () => void
  onDiscardDraw: () => void
  onCallCabo: () => void
  countdownLabel?: string
  onKeepKingPeek?: () => void
  onSwapKingPeek?: () => void
  isKingSwapArmed?: boolean
  showActionBar?: boolean
  now: number
  maskCard: (card: PublicCardView) => PublicCardView
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

const SelfHand = ({
  room,
  onSwap,
  onSlap,
  onSelectPowerTarget,
  onDrawDeck,
  onTakeDiscard,
  onDiscardDraw,
  onCallCabo,
  countdownLabel,
  onKeepKingPeek,
  onSwapKingPeek,
  isKingSwapArmed,
  showActionBar = true,
  now,
  maskCard,
}: Props) => {
  const selfPlayer = room.players.find((player) => player.id === room.selfPlayerId)
  const isSelfTurn = room.turnPlayerId === room.selfPlayerId
  const turnRemaining = room.turnStartedAt ? Math.max(0, 15_000 - (now - room.turnStartedAt)) : 0
  const turnProgress = room.turnStartedAt ? Math.max(0, Math.min(1, turnRemaining / 15_000)) : 0
  const hasPendingDraw = room.turnPlayerId === selfPlayer?.id && Boolean(room.pendingDraw)

  if (!selfPlayer) return null

  return (
    <section className="self-hand">
      <div className="self-status">
        <span>{selfPlayer.name}</span>
        {room.roundResult && <strong>+{room.roundResult.deltas[selfPlayer.id] ?? 0}</strong>}
      </div>
      {countdownLabel && (
        <div className="power-instructions">
          <span>{countdownLabel}</span>
          {room.pendingPower?.type === "king" && room.pendingPower.hasPeeked && onKeepKingPeek && onSwapKingPeek && (
            <div className="power-decision">
              <button type="button" onClick={onKeepKingPeek}>
                Keep
              </button>
              <button type="button" className={isKingSwapArmed ? "is-armed" : ""} onClick={onSwapKingPeek}>
                Swap
              </button>
            </div>
          )}
        </div>
      )}

      <div
        className={`seat seat-self ${isSelfTurn ? "is-current-turn" : ""} ${room.caboCallerId === selfPlayer.id ? "is-cabo-caller" : ""} ${hasPendingDraw ? "is-thinking" : ""}`}
        style={{ "--turn-progress": `${turnProgress}` } as CSSProperties}
      >
        <div className="seat-header">
          <div>
            <h3>{selfPlayer.name}</h3>
            <p>{selfPlayer.connected ? "Connected" : "Reconnecting"}</p>
          </div>
          {isSelfTurn && <div className="turn-meter" aria-hidden="true" />}
          <div className="score-pill">{selfPlayer.score}</div>
        </div>
        <div className={`seat-cards ${room.phase !== "playing" ? "is-round-reveal" : ""}`}>
          {selfPlayer.cards.map((card, cardIndex) => {
            const powerTarget = isPowerTarget(room, selfPlayer.id, cardIndex, isKingSwapArmed)
            return (
            <button
              className={`card-slot is-self ${room.pendingPower ? (powerTarget ? "is-power-target" : "is-power-locked") : ""}`.trim()}
              key={`${selfPlayer.id}-${cardIndex}`}
              type="button"
              onClick={() => {
                if (room.pendingDraw) onSwap(cardIndex)
                else if (room.pendingPower && powerTarget) onSelectPowerTarget({ playerId: selfPlayer.id, cardIndex })
                else if (room.settings.slapEnabled) onSlap(cardIndex)
              }}
              disabled={Boolean(room.pendingPower) && !powerTarget}
            >
              <CardVisual
                card={maskCard(card)}
                interactive={!room.pendingPower || powerTarget}
                dimmed={Boolean(room.pendingPower) && !powerTarget}
                className={room.pendingDraw ? "is-swap-target" : room.pendingPower && powerTarget ? "is-power-target" : ""}
              />
            </button>
            )
          })}
        </div>
      </div>

      {showActionBar && (
        <ActionBar
          canDraw={isSelfTurn && !room.pendingDraw}
          hasPendingDraw={Boolean(isSelfTurn && room.pendingDraw && room.pendingDraw.source === "deck")}
          canTakeDiscard={isSelfTurn && !room.pendingDraw}
          onDrawDeck={onDrawDeck}
          onTakeDiscard={onTakeDiscard}
          onDiscardDraw={onDiscardDraw}
          onCallCabo={onCallCabo}
        />
      )}
    </section>
  )
}

export default SelfHand
