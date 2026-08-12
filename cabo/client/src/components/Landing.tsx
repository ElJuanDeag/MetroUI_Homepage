import { useMemo, useState } from "react"

type Props = {
  initialRoomCode: string
  onCreateRoom: (hostName: string, settings: { slapEnabled: boolean; caboPenalty: number }) => Promise<void>
  onJoinRoom: (roomCode: string, playerName: string) => void
}

const Landing = ({ initialRoomCode, onCreateRoom, onJoinRoom }: Props) => {
  const [hostName, setHostName] = useState("")
  const [guestName, setGuestName] = useState("")
  const [roomCode, setRoomCode] = useState(initialRoomCode)
  const [slapEnabled, setSlapEnabled] = useState(true)
  const [caboPenalty, setCaboPenalty] = useState(5)

  const canCreate = useMemo(() => hostName.trim().length >= 2, [hostName])
  const canJoin = useMemo(() => roomCode.trim().length >= 4 && guestName.trim().length >= 2, [roomCode, guestName])

  return (
    <div className="cabo-shell">
      <section className="hero">
        <p className="eyebrow">play.braje.sh</p>
        <h1>Cabo with real rooms, real invites, real hidden state.</h1>
        <p className="lede">
          Create a room, share a code, and play across devices. Server-side rules keep deck order, powers, Cabo timing,
          and slap races authoritative.
        </p>
      </section>

      <section className="panel-grid">
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault()
            if (!canCreate) return
            void onCreateRoom(hostName.trim(), { slapEnabled, caboPenalty })
          }}
        >
          <h2>Create room</h2>
          <label>
            Display name
            <input value={hostName} onChange={(event) => setHostName(event.target.value)} placeholder="Brajesh" />
          </label>
          <label className="inline-toggle">
            <input checked={slapEnabled} onChange={(event) => setSlapEnabled(event.target.checked)} type="checkbox" />
            Enable slap rule
          </label>
          <label>
            Cabo penalty
            <input
              value={caboPenalty}
              onChange={(event) => setCaboPenalty(Number(event.target.value) || 0)}
              type="number"
              min={0}
              max={20}
            />
          </label>
          <button disabled={!canCreate} type="submit">
            Create room
          </button>
        </form>

        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault()
            if (!canJoin) return
            onJoinRoom(roomCode.trim().toUpperCase(), guestName.trim())
          }}
        >
          <h2>Join room</h2>
          <label>
            Room code
            <input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} placeholder="ABC123" />
          </label>
          <label>
            Display name
            <input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Friend" />
          </label>
          <button disabled={!canJoin} type="submit">
            Join
          </button>
        </form>
      </section>
    </div>
  )
}

export default Landing
