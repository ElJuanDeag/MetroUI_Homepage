import type { PublicCardView } from "../types"
import CardVisual from "./CardVisual"

const DiscardPile = ({ card, isSlapWindowActive }: { card?: PublicCardView; isSlapWindowActive: boolean }) => (
  <div className={`pile-stack discard-stack ${isSlapWindowActive ? "is-slap-window" : ""}`}>
    <div className="discard-history" aria-hidden="true">
      <CardVisual className="history-card history-1" />
      <CardVisual className="history-card history-2" />
    </div>
    <CardVisual card={card} className={`discard-top-card ${card ? "is-incoming" : ""}`} />
  </div>
)

export default DiscardPile
