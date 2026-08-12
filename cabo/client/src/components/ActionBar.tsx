type Props = {
  canDraw: boolean
  hasPendingDraw: boolean
  canTakeDiscard: boolean
  onDrawDeck: () => void
  onTakeDiscard: () => void
  onDiscardDraw: () => void
  onCallCabo: () => void
}

const ActionBar = ({ canDraw, hasPendingDraw, canTakeDiscard, onDrawDeck, onTakeDiscard, onDiscardDraw, onCallCabo }: Props) => (
  <div className="action-bar">
    <button type="button" disabled={!canDraw} onClick={onDrawDeck}>
      Draw
    </button>
    <button type="button" disabled={!canTakeDiscard} onClick={onTakeDiscard}>
      Take discard
    </button>
    <button type="button" disabled={!hasPendingDraw} onClick={onDiscardDraw}>
      Use power / discard
    </button>
    <button type="button" className="is-warn" disabled={!canDraw || hasPendingDraw} onClick={onCallCabo}>
      Call Cabo
    </button>
  </div>
)

export default ActionBar
