import { useMemo, useState } from "react"

type Props = {
  initialRoomCode: string | null
  initialRoomError?: string | null
  onCreateRoom: (hostName: string, settings: { slapEnabled: boolean; caboPenalty: number }) => Promise<void>
  onJoinRoom: (roomCode: string, playerName: string) => void
}

type LandingMode = "hero" | "choice" | "create" | "join" | "join-url"

const Landing = ({ initialRoomCode, initialRoomError, onCreateRoom, onJoinRoom }: Props) => {
  const [hostName, setHostName] = useState("")
  const [guestName, setGuestName] = useState("")
  const [roomCode, setRoomCode] = useState(initialRoomCode || "")
  const [slapEnabled, setSlapEnabled] = useState(true)
  const [caboPenalty, setCaboPenalty] = useState(5)
  const [mode, setMode] = useState<LandingMode>(initialRoomCode ? "join-url" : "hero")

  const canCreate = useMemo(() => hostName.trim().length >= 2, [hostName])
  const canJoin = useMemo(() => roomCode.trim().length >= 4 && guestName.trim().length >= 2, [roomCode, guestName])
  const showHero = mode === "hero" || mode === "choice"

  return (
    <div className="cabo-shell landing-shell">
      <section className={`hero stage-card ${showHero ? "is-visible" : ""}`}>
        <p className="eyebrow">play.braje.sh</p>
        <h1>Cabo for late-night bluffing, memory, and bad confidence.</h1>
        <p className="lede">
          Private rooms, server-trusted hidden state, quick invites, and a table-first experience built for real remote games.
        </p>
        {initialRoomError && <p className="inline-error">{initialRoomError}</p>}
        {mode === "hero" && (
          <button type="button" className="hero-cta" onClick={() => setMode("choice")}>
            Play
          </button>
        )}
        {mode === "choice" && (
          <div className="choice-row">
            <button type="button" onClick={() => setMode("create")}>
              Create a room
            </button>
            <button type="button" onClick={() => setMode("join")}>
              Join a room
            </button>
          </div>
        )}
      </section>

      {(mode === "create" || mode === "join" || mode === "join-url") && (
        <section className="panel stage-card is-visible landing-panel">
          {mode === "create" && (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (!canCreate) return
                void onCreateRoom(hostName.trim(), { slapEnabled, caboPenalty })
              }}
            >
              <h2>Create a room</h2>
              <label>
                Your name
                <input value={hostName} onChange={(event) => setHostName(event.target.value)} placeholder="Brajesh" />
              </label>
              <label className="inline-toggle">
                <input checked={slapEnabled} onChange={(event) => setSlapEnabled(event.target.checked)} type="checkbox" />
                Enable slap rule
              </label>
              <label>
                Cabo penalty
                <input value={caboPenalty} onChange={(event) => setCaboPenalty(Number(event.target.value) || 0)} type="number" min={0} max={20} />
              </label>
              <div className="action-row">
                <button type="button" onClick={() => setMode("choice")}>
                  Back
                </button>
                <button disabled={!canCreate} type="submit">
                  Create
                </button>
              </div>
            </form>
          )}

          {mode === "join" && (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (!canJoin) return
                onJoinRoom(roomCode.trim().toUpperCase(), guestName.trim())
              }}
            >
              <h2>Join a room</h2>
              <label>
                Room code
                <input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} placeholder="ABC123" />
              </label>
              <label>
                Your name
                <input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Friend" />
              </label>
              <div className="action-row">
                <button type="button" onClick={() => setMode("choice")}>
                  Back
                </button>
                <button disabled={!canJoin} type="submit">
                  Join
                </button>
              </div>
            </form>
          )}

          {mode === "join-url" && (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (!canJoin) return
                onJoinRoom(roomCode.trim().toUpperCase(), guestName.trim())
              }}
            >
              <p className="eyebrow">Direct invite</p>
              <h2>Join room {roomCode}</h2>
              <label>
                Your name
                <input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Friend" autoFocus />
              </label>
              <div className="action-row">
                <button disabled={!canJoin} type="submit">
                  Join room
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  )
}

export default Landing
