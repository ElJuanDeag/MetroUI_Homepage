export default function Gamma(){
  return (
    <div style={{ padding: 24, height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <h1>Instagram</h1>
      <div style={{ flex: 1, minHeight: 420, border: "1px solid rgba(255, 255, 255, 0.2)" }}>
        <iframe
          src="https://www.instagram.com/brawwjesh/embed"
          title="Instagram Preview"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
      <a href="https://www.instagram.com/brawwjesh" target="_blank" rel="noreferrer">
        Open Profile
      </a>
    </div>
  )
}
