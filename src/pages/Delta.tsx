export default function Delta(){
  return (
    <div style={{ padding: 24, height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <h1>LinkedIn</h1>
      <div style={{ flex: 1, minHeight: 420, border: "1px solid rgba(255, 255, 255, 0.2)" }}>
        <iframe
          src="https://www.linkedin.com/in/brajesh-kumar-6103401b4/"
          title="LinkedIn Preview"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
      <a href="https://www.linkedin.com/in/brajesh-kumar-6103401b4/" target="_blank" rel="noreferrer">
        Open Profile
      </a>
    </div>
  )
}
