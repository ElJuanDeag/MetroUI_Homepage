type Props = {
  messages: string[]
  open: boolean
  onToggle: () => void
}

const LogDrawer = ({ messages, open, onToggle }: Props) => (
  <aside className={`log-drawer ${open ? "is-open" : ""}`}>
    <button type="button" className="log-toggle" onClick={onToggle}>
      {open ? "Hide log" : "Show log"}
    </button>
    <div className="log-drawer-body">
      <p className="eyebrow">Table log</p>
      <ul>
        {messages.map((message, index) => (
          <li key={`${message}-${index}`}>{message}</li>
        ))}
      </ul>
    </div>
  </aside>
)

export default LogDrawer
