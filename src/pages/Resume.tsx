export default function Resume() {
  return (
    <div style={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "0 24px 12px" }}>
        <a href="/assets/Resume.pdf" target="_blank" rel="noreferrer">
          Open in new tab
        </a>
      </div>

      <div style={{ flex: 1, minHeight: 420, borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
        <iframe
          src="/assets/Resume.pdf"
          title="Resume PDF"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
    </div>
  )
}
