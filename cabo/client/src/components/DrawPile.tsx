import type { PublicCardView } from "../types"
import CardVisual from "./CardVisual"

const DrawPile = ({ count, pendingCard, isActive }: { count: number; pendingCard?: PublicCardView; isActive: boolean }) => (
  <div className={`pile-stack draw-stack ${isActive ? "is-active" : ""}`}>
    <div className="card-stack-plates" aria-hidden="true">
      <CardVisual className="stack-plate plate-1" />
      <CardVisual className="stack-plate plate-2" />
      <CardVisual className="stack-plate plate-3" />
    </div>
    <div className="pile-center">
      <CardVisual className="stack-top" />
      <span className="pile-badge">{count}</span>
    </div>
    {pendingCard && <CardVisual card={pendingCard} className="drawn-staging-card" />}
  </div>
)

export default DrawPile
