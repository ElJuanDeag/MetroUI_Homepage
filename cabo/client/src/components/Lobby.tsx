import type { RoomView } from "../types"
import InvitePanel from "./InvitePanel"

type Props = {
  room: RoomView
  onReady: (ready: boolean) => void
  onStart: () => void
}

const Lobby = ({ room, onReady, onStart }: Props) => {
  const self = room.players.find((player) => player.id === room.selfPlayerId)

  return (
    <div className="cabo-shell lobby-shell">
      <InvitePanel roomId={room.roomId} />
      <section className="panel lobby-panel">
        <div className="panel-header lobby-header">
          <div>
            <p className="eyebrow">Lobby</p>
            <h2>{room.players.length}/4 seated</h2>
          </div>
          <div className="settings-inline">
            <span>Slap: {room.settings.slapEnabled ? "On" : "Off"}</span>
            <span>Penalty: +{room.settings.caboPenalty}</span>
          </div>
        </div>
        <div className="player-list">
          {room.players.map((player) => (
            <div className={`player-chip ${player.ready ? "is-ready" : ""}`} key={player.id}>
              <strong>{player.name}</strong>
              <span>{player.connected ? "Connected" : "Reconnecting"}</span>
              <span>{player.ready ? "Ready" : "Not ready"}</span>
              {player.isHost && <span>Host</span>}
            </div>
          ))}
        </div>
        <div className="action-row lobby-actions">
          {!self?.isHost && (
            <button type="button" onClick={() => onReady(!self?.ready)}>
              {self?.ready ? "Unready" : "Ready up"}
            </button>
          )}
          {self?.isHost && (
            <button type="button" onClick={onStart}>
              Start game
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

export default Lobby
