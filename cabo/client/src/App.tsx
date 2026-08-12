import { useMemo, useState } from "react"
import Landing from "./components/Landing"
import Lobby from "./components/Lobby"
import DrawPile from "./components/DrawPile"
import DiscardPile from "./components/DiscardPile"
import PlayerGrid from "./components/PlayerGrid"
import { useCaboSocket } from "./useCaboSocket"
import type { CreateRoomResponse } from "./types"

const initialRoomCode = new URLSearchParams(window.location.search).get("room")?.toUpperCase() || ""

const App = () => {
  const [roomId, setRoomId] = useState<string | null>(initialRoomCode || null)
  const [playerName, setPlayerName] = useState<string | null>(null)
  const { room, error, send } = useCaboSocket(roomId, playerName)

  const isLanding = !roomId || !playerName
  const title = useMemo(() => {
    if (!room) return "Cabo"
    if (room.phase === "lobby") return "Lobby"
    if (room.phase === "playing") return `Round ${room.round}`
    return "Round over"
  }, [room])

  if (isLanding) {
    return (
      <Landing
        initialRoomCode={initialRoomCode}
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
          history.replaceState(null, "", `?room=${nextRoomId}`)
        }}
      />
    )
  }

  return (
    <main className="cabo-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">Room {room?.roomId || roomId}</p>
          <h1>{title}</h1>
        </div>
        {room?.turnPlayerId && <span>Turn: {room.players.find((player) => player.id === room.turnPlayerId)?.name}</span>}
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
          <section className="table-row">
            <DrawPile count={room.deckCount} onDraw={() => send({ type: "DRAW_FROM_DECK" })} />
            <DiscardPile card={room.topDiscard} />
            <div className="panel">
              <p className="eyebrow">Actions</p>
              <div className="action-row">
                <button type="button" onClick={() => send({ type: "DRAW_FROM_DISCARD" })}>
                  Take discard
                </button>
                <button type="button" onClick={() => send({ type: "DISCARD_DRAWN_CARD" })}>
                  Discard draw
                </button>
                <button type="button" onClick={() => send({ type: "CALL_CABO" })}>
                  Call Cabo
                </button>
              </div>
            </div>
          </section>

          <PlayerGrid
            room={room}
            onSwap={(index) => send({ type: "SWAP_DRAWN_CARD", cardIndex: index })}
            onSlap={(index) => send({ type: "SLAP_DISCARD", cardIndex: index })}
          />

          <section className="panel log-panel">
            <p className="eyebrow">Table log</p>
            <ul>
              {room.messageLog.map((message, index) => (
                <li key={`${message}-${index}`}>{message}</li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  )
}

export default App
