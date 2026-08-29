import { useEffect, useMemo, useState } from "react"
import Landing from "./components/Landing"
import Lobby from "./components/Lobby"
import DrawPile from "./components/DrawPile"
import DiscardPile from "./components/DiscardPile"
import PlayerGrid from "./components/PlayerGrid"
import { useCaboSocket } from "./useCaboSocket"
import type { CreateRoomResponse, PublicCardView, TargetCard } from "./types"
import LogDrawer from "./components/LogDrawer"
import SelfHand from "./components/SelfHand"
import { useSoundManager } from "./sound"

const initialRoomCode = new URLSearchParams(window.location.search).get("room")?.toUpperCase() || null

const App = () => {
  const [roomId, setRoomId] = useState<string | null>(initialRoomCode)
  const [playerName, setPlayerName] = useState<string | null>(null)
  const [initialRoomStatus, setInitialRoomStatus] = useState<"idle" | "checking" | "valid" | "invalid">(initialRoomCode ? "checking" : "idle")
  const [landingError, setLandingError] = useState<string | null>(null)
  const [logOpen, setLogOpen] = useState(false)
  const [powerSelection, setPowerSelection] = useState<TargetCard | undefined>()
  const [kingSwapArmed, setKingSwapArmed] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [peekRevealExpiry, setPeekRevealExpiry] = useState<Record<string, number>>({})
  const { room, error, send } = useCaboSocket(roomId, playerName)
  const { muted, toggleMuted } = useSoundManager(room)

  useEffect(() => {
    if (!initialRoomCode || playerName) return

    let cancelled = false
    fetch(`/api/rooms/${initialRoomCode}`)
      .then((response) => {
        if (!response.ok) throw new Error("That room no longer exists.")
        if (cancelled) return
        setInitialRoomStatus("valid")
      })
      .catch(() => {
        if (cancelled) return
        setInitialRoomStatus("invalid")
        setLandingError("That room no longer exists.")
        setRoomId(null)
        history.replaceState(null, "", window.location.pathname)
      })

    return () => {
      cancelled = true
    }
  }, [playerName])

  useEffect(() => {
    if (!room?.pendingPower) {
      setPowerSelection(undefined)
      setKingSwapArmed(false)
      return
    }

    if (room.pendingPower.type === "blind-swap") {
      setPowerSelection(room.pendingPower.first)
      return
    }

    if (room.pendingPower.type === "king") {
      setPowerSelection(room.pendingPower.first)
      return
    }

    setPowerSelection(undefined)
    setKingSwapArmed(false)
  }, [room?.pendingPower])

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!room?.pendingPower?.first) return
    if (room.pendingPower.type !== "peek-self" && room.pendingPower.type !== "peek-opponent" && !(room.pendingPower.type === "king" && room.pendingPower.hasPeeked)) {
      return
    }

    const targetPlayer = room.players.find((player) => player.id === room.pendingPower?.first?.playerId)
    const targetCard = targetPlayer?.cards[room.pendingPower.first.cardIndex]
    if (!targetCard) return

    setPeekRevealExpiry((current) => {
      if (current[targetCard.id]) return current
      return { ...current, [targetCard.id]: Date.now() + 2_500 }
    })
  }, [room?.pendingPower, room?.players])

  useEffect(() => {
    if (room?.phase === "round-end" || room?.phase === "match-end") {
      setPeekRevealExpiry({})
      return
    }

    setPeekRevealExpiry((current) => {
      const activeCardIds = new Set(room?.players.flatMap((player) => player.cards.map((card) => card.id)) ?? [])
      const nextEntries = Object.entries(current).filter(([cardId]) => activeCardIds.has(cardId))
      return nextEntries.length === Object.keys(current).length ? current : Object.fromEntries(nextEntries)
    })
  }, [room])

  const isLanding = !roomId || !playerName
  const title = useMemo(() => {
    if (!room) return "Cabo"
    if (room.phase === "lobby") return "Lobby"
    if (room.phase === "playing") return `Round ${room.round}`
    return room.phase === "match-end" ? "Match settled" : "Round over"
  }, [room])

  const pendingCard = room?.pendingDraw?.card
  const peekCountdown = room?.peekPhaseEndsAt ? Math.max(0, Math.ceil((room.peekPhaseEndsAt - now) / 1000)) : 0
  const discardWindowRemaining = room?.discardLandedAt ? Math.max(0, 2000 - (now - room.discardLandedAt)) : 0
  const powerPrompt = useMemo(() => {
    if (!room?.pendingPower) return undefined
    if (room.pendingPower.type === "peek-self") return "Choose one of your own cards to peek."
    if (room.pendingPower.type === "peek-opponent") return "Choose an opponent's card to peek."
    if (room.pendingPower.type === "blind-swap") {
      return powerSelection ? "Choose the second card to swap." : "Choose two cards to swap, no peeking."
    }
    if (!room.pendingPower.hasPeeked) return "Choose a card to peek."
    return kingSwapArmed ? "Choose another card to swap with the peeked card." : "Keep this card, or swap it with another?"
  }, [kingSwapArmed, powerSelection, room?.pendingPower])

  const maskCard = (card: PublicCardView): PublicCardView => {
    const revealExpiry = peekRevealExpiry[card.id]
    if (!revealExpiry) return card
    if (now < revealExpiry) return card
    return { kind: "hidden" as const, id: card.id }
  }

  const selectPowerTarget = (target: TargetCard) => {
    if (!room?.pendingPower) return

    if (room.pendingPower.type === "peek-self" || room.pendingPower.type === "peek-opponent") {
      send({ type: "RESOLVE_POWER", first: target })
      return
    }

    if (room.pendingPower.type === "blind-swap") {
      const first = powerSelection ?? target
      if (!powerSelection) {
        setPowerSelection(target)
        return
      }
      send({ type: "RESOLVE_POWER", first, second: target })
      return
    }

    if (!room.pendingPower.hasPeeked) {
      send({ type: "RESOLVE_POWER", first: target })
      return
    }

    if (kingSwapArmed && powerSelection) {
      send({ type: "RESOLVE_POWER", first: powerSelection, second: target, swap: true })
    }
  }

  if (initialRoomStatus === "checking" && !playerName) {
    return (
      <main className="cabo-shell loading-shell">
        <section className="hero stage-card is-visible">
          <p className="eyebrow">Invite</p>
          <h1>Looking up room {initialRoomCode}</h1>
          <p className="lede">Checking that the invite is still live before we show the join form.</p>
        </section>
      </main>
    )
  }

  if (isLanding) {
    return (
      <Landing
        initialRoomCode={initialRoomStatus === "valid" ? initialRoomCode : null}
        initialRoomError={landingError}
        onCreateRoom={async (hostName, settings) => {
          const response = await fetch("/api/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hostName, settings }),
          })
          const data = (await response.json()) as CreateRoomResponse & { playerToken?: string }
          if (data.playerToken) localStorage.setItem(`cabo:${data.roomId}:token`, data.playerToken)
          setPlayerName(hostName)
          setRoomId(data.roomId)
          history.replaceState(null, "", `?room=${data.roomId}`)
        }}
        onJoinRoom={(nextRoomId, nextPlayerName) => {
          setPlayerName(nextPlayerName)
          setRoomId(nextRoomId)
          setInitialRoomStatus("valid")
          history.replaceState(null, "", `?room=${nextRoomId}`)
        }}
      />
    )
  }

  return (
    <main className="cabo-shell">
      <header className="game-header table-header">
        <div>
          <p className="eyebrow">Room {room?.roomId || roomId}</p>
          <h1>{title}</h1>
        </div>
        <div className="table-status">
          {room?.turnPlayerId && <span>Turn: {room.players.find((player) => player.id === room.turnPlayerId)?.name}</span>}
          {room?.pendingPower && <span>Power: {room.pendingPower.type}</span>}
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {room?.phase === "lobby" && (
        <Lobby
          room={room}
          onReady={(ready) => send({ type: "SET_READY", ready })}
          onStart={() => send({ type: "START_GAME" })}
        />
      )}

      {room && room.phase !== "lobby" && (
        <>
          <section className={`table-stage phase-${room.phase}`}>
            <div className="table-surface">
              <div className="table-center">
                <DrawPile count={room.deckCount} pendingCard={pendingCard} isActive={Boolean(room.pendingDraw?.source === "deck")} />
                <DiscardPile card={room.topDiscard} isSlapWindowActive={discardWindowRemaining > 0} />
              </div>

              <PlayerGrid
                room={room}
                onSelectPowerTarget={selectPowerTarget}
                isKingSwapArmed={kingSwapArmed}
                now={now}
                maskCard={maskCard}
              />

              <SelfHand
                room={room}
                onSwap={(index) => send({ type: "SWAP_DRAWN_CARD", cardIndex: index })}
                onSlap={(index) => send({ type: "SLAP_DISCARD", cardIndex: index })}
                onSelectPowerTarget={selectPowerTarget}
                onDrawDeck={() => send({ type: "DRAW_FROM_DECK" })}
                onTakeDiscard={() => send({ type: "DRAW_FROM_DISCARD" })}
                onDiscardDraw={() => send({ type: "DISCARD_DRAWN_CARD" })}
                onCallCabo={() => send({ type: "CALL_CABO" })}
                onKeepKingPeek={
                  room.pendingPower?.type === "king" && room.pendingPower.hasPeeked && powerSelection
                    ? () => send({ type: "RESOLVE_POWER", first: powerSelection, swap: false })
                    : undefined
                }
                onSwapKingPeek={
                  room.pendingPower?.type === "king" && room.pendingPower.hasPeeked
                    ? () => setKingSwapArmed(true)
                    : undefined
                }
                isKingSwapArmed={kingSwapArmed}
                countdownLabel={room.phase === "peek" ? `Memorize your cards: ${peekCountdown}s` : powerPrompt}
                showActionBar={room.phase !== "peek"}
                now={now}
                maskCard={maskCard}
              />
            </div>
          </section>

          <section className="round-reveal-strip">
            {room.roundResult && (
              <div className="panel round-summary">
                <p className="eyebrow">{room.phase === "match-end" ? "Match end" : "Round reveal"}</p>
                <h2>{room.roundResult.winnerIds.map((id) => room.players.find((player) => player.id === id)?.name || id).join(", ")} lead the board.</h2>
                <div className="summary-grid">
                  {room.players.map((player) => (
                    <div className="summary-chip" key={player.id}>
                      <strong>{player.name}</strong>
                      <span>Round {room.roundResult?.totals[player.id] ?? 0}</span>
                      <span>Total {player.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="floating-ui">
            <button type="button" className="mute-toggle" onClick={toggleMuted}>
              {muted ? "Sound off" : "Sound on"}
            </button>
            <LogDrawer messages={room.messageLog} open={logOpen} onToggle={() => setLogOpen((current) => !current)} />
          </section>
        </>
      )}
    </main>
  )
}

export default App
