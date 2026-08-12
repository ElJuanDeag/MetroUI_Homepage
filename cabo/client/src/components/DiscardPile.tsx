import type { PublicCardView } from "../../shared/game.js"
import CardVisual from "./CardVisual"

const DiscardPile = ({ card }: { card?: PublicCardView }) => (
  <div className="pile-stack discard-stack">
    <div className="discard-history" aria-hidden="true">
      <CardVisual className="history-card history-1" />
      <CardVisual className="history-card history-2" />
    </div>
    <CardVisual card={card} className={`discard-top-card ${card ? "is-incoming" : ""}`} />
  </div>
)

export default DiscardPile
