import { useEffect, useState } from "react"
import type { PublicCardView } from "../types"

type Props = {
  card?: PublicCardView
  className?: string
  interactive?: boolean
  dimmed?: boolean
}

const suitColor = (suit: "spades" | "clubs" | "hearts" | "diamonds" | "joker") =>
  suit === "hearts" || suit === "diamonds" ? "#cf263d" : "#1a2433"

const suitGlyph = (suit: "spades" | "clubs" | "hearts" | "diamonds" | "joker") => {
  if (suit === "spades") return "\u2660"
  if (suit === "clubs") return "\u2663"
  if (suit === "hearts") return "\u2665"
  if (suit === "diamonds") return "\u2666"
  return "\u2605"
}

const HiddenCardSvg = () => (
  <svg viewBox="0 0 160 224" aria-hidden="true">
    <defs>
      <linearGradient id="card-back-fill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#16344f" />
        <stop offset="100%" stopColor="#0b1b2e" />
      </linearGradient>
      <pattern id="card-back-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 10H20M10 0V20" stroke="rgba(134,231,214,0.22)" strokeWidth="1.2" />
        <circle cx="10" cy="10" r="2.2" fill="rgba(255,255,255,0.17)" />
      </pattern>
    </defs>
    <rect x="6" y="6" width="148" height="212" rx="16" fill="url(#card-back-fill)" />
    <rect x="16" y="16" width="128" height="192" rx="11" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
    <rect x="24" y="24" width="112" height="176" rx="8" fill="url(#card-back-pattern)" />
    <circle cx="80" cy="112" r="26" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
    <text x="80" y="121" textAnchor="middle" fontSize="34" fill="#eef7ff" fontFamily="Georgia, serif">
      {"\u2726"}
    </text>
  </svg>
)

const VisibleCardSvg = ({ card }: { card: Extract<PublicCardView, { kind: "visible" }> }) => {
  const color = suitColor(card.suit)
  const glyph = suitGlyph(card.suit)
  const isJoker = card.rank === "JK" || card.suit === "joker"

  return (
    <svg viewBox="0 0 160 224" aria-label={`${card.rank} ${card.suit}`} role="img">
      <rect x="4" y="4" width="152" height="216" rx="18" fill="#fcf9f2" />
      <rect x="9" y="9" width="142" height="206" rx="15" fill="none" stroke="rgba(18,26,39,0.12)" strokeWidth="2" />
      <g fill={color} fontFamily="Georgia, serif">
        <text x="24" y="34" fontSize="24" fontWeight="700">
          {card.rank === "JK" ? "J" : card.rank}
        </text>
        <text x="24" y="58" fontSize="22">
          {glyph}
        </text>
        <g transform="translate(160 224) rotate(180)">
          <text x="24" y="34" fontSize="24" fontWeight="700">
            {card.rank === "JK" ? "J" : card.rank}
          </text>
          <text x="24" y="58" fontSize="22">
            {glyph}
          </text>
        </g>
      </g>
      {isJoker ? (
        <g transform="translate(80 112)">
          <circle r="40" fill="rgba(207,38,61,0.1)" />
          <text y="-6" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1a2433" fontFamily="Georgia, serif">
            JOKER
          </text>
          <text y="24" textAnchor="middle" fontSize="38" fill="#cf263d" fontFamily="Georgia, serif">
            {"\u2605"}
          </text>
        </g>
      ) : (
        <g transform="translate(80 114)" fill={color} fontFamily="Georgia, serif">
          <text y="-8" textAnchor="middle" fontSize="58">
            {glyph}
          </text>
          <text y="44" textAnchor="middle" fontSize="16" fontWeight="700">
            {card.rank}
          </text>
        </g>
      )}
    </svg>
  )
}

const CardVisual = ({ card, className = "", interactive = false, dimmed = false }: Props) => {
  const [motionClass, setMotionClass] = useState("")
  const cardId = card?.id

  useEffect(() => {
    if (!cardId) return
    setMotionClass("is-card-changing")
    const timeout = window.setTimeout(() => setMotionClass(""), 320)
    return () => window.clearTimeout(timeout)
  }, [cardId])

  return (
    <div className={`playing-card ${interactive ? "is-interactive" : ""} ${dimmed ? "is-dimmed" : ""} ${motionClass} ${className}`.trim()}>
      {card?.kind === "visible" ? <VisibleCardSvg card={card} /> : <HiddenCardSvg />}
    </div>
  )
}

export default CardVisual
