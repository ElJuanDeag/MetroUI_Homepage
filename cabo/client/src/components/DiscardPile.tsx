import type { PublicCardView } from "../../shared/game.js"

const DiscardPile = ({ card }: { card?: PublicCardView }) => (
  <div className="pile">
    <p className="eyebrow">Discard</p>
    <div className="card-face">
      {card?.kind === "visible" ? `${card.rank} ${card.suit}` : "Empty"}
    </div>
  </div>
)

export default DiscardPile
