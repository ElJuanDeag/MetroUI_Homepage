export type PlayerId = string
export type RoomId = string

export type Suit = "spades" | "clubs" | "hearts" | "diamonds" | "joker"
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "JK"

export type PowerType = "peek-self" | "peek-opponent" | "blind-swap" | "king"
export type DrawSource = "deck" | "discard"
export type Phase = "lobby" | "playing" | "round-end" | "match-end"

export type Card = {
  id: string
  rank: Rank
  suit: Suit
  value: number
  power?: PowerType
}

export type PlayerState = {
  id: PlayerId
  token: string
  name: string
  connected: boolean
  ready: boolean
  isHost: boolean
  cards: Card[]
  knownToSelf: string[]
  score: number
  disconnectedAt?: number
}

export type PendingDraw = {
  card: Card
  source: DrawSource
  mustSwap: boolean
}

export type PendingPower =
  | {
      type: "peek-self"
      actorId: PlayerId
    }
  | {
      type: "peek-opponent"
      actorId: PlayerId
      targetPlayerId?: PlayerId
    }
  | {
      type: "blind-swap"
      actorId: PlayerId
      first?: TargetCard
    }
  | {
      type: "king"
      actorId: PlayerId
      first?: TargetCard
      hasPeeked?: boolean
    }

export type TargetCard = {
  playerId: PlayerId
  cardIndex: number
}

export type RoomSettings = {
  slapEnabled: boolean
  caboPenalty: number
  scoreLimit: number
}

export type RoundResult = {
  winnerIds: PlayerId[]
  deltas: Record<PlayerId, number>
  totals: Record<PlayerId, number>
  caboCallerId?: PlayerId
}

export type RoomState = {
  roomId: RoomId
  phase: Phase
  settings: RoomSettings
  players: PlayerState[]
  turnPlayerId?: PlayerId
  deck: Card[]
  discard: Card[]
  pendingDraw?: PendingDraw
  pendingPower?: PendingPower
  caboCallerId?: PlayerId
  finalTurnsRemaining: PlayerId[]
  round: number
  revealAll: boolean
  roundResult?: RoundResult
  createdAt: number
  updatedAt: number
  messageLog: string[]
}

export type PublicCardView =
  | {
      kind: "hidden"
      id: string
    }
  | {
      kind: "visible"
      id: string
      rank: Rank
      suit: Suit
      value: number
    }

export type PlayerView = {
  id: PlayerId
  name: string
  ready: boolean
  connected: boolean
  isHost: boolean
  score: number
  cards: PublicCardView[]
  cardCount: number
}

export type RoomView = {
  roomId: RoomId
  phase: Phase
  settings: RoomSettings
  players: PlayerView[]
  selfPlayerId?: PlayerId
  turnPlayerId?: PlayerId
  topDiscard?: PublicCardView
  deckCount: number
  pendingDraw?: {
    source: DrawSource
    card?: PublicCardView
    mustSwap: boolean
  }
  pendingPower?: PendingPower
  caboCallerId?: PlayerId
  finalTurnsRemaining: PlayerId[]
  round: number
  messageLog: string[]
  roundResult?: RoundResult
}
