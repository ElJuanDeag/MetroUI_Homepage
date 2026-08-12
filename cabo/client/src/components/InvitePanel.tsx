type Props = {
  roomId: string
}

const InvitePanel = ({ roomId }: Props) => {
  const inviteUrl = `${window.location.origin}?room=${roomId}`

  return (
    <div className="panel invite-panel">
      <div>
        <p className="eyebrow">Invite</p>
        <h3>{roomId}</h3>
        <p>{inviteUrl}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(inviteUrl)
        }}
      >
        Copy link
      </button>
    </div>
  )
}

export default InvitePanel
