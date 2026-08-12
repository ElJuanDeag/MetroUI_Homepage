const DrawPile = ({ count, onDraw }: { count: number; onDraw: () => void }) => (
  <div className="pile">
    <p className="eyebrow">Draw pile</p>
    <div className="card-face">{count} cards</div>
    <button type="button" onClick={onDraw}>
      Draw
    </button>
  </div>
)

export default DrawPile
