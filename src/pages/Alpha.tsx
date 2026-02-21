export default function Alpha(){
  return (
    <div style={{ padding: 24, height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <h1>YouTube</h1>
      <div style={{ flex: 1, minHeight: 420, border: "1px solid rgba(255, 255, 255, 0.2)" }}>
        <iframe
          src="https://www.youtube.com/embed?listType=search&list=ElJuanDeag"
          title="YouTube Preview"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
      <a href="https://www.youtube.com/@ElJuanDeag" target="_blank" rel="noreferrer">
        Open Channel
      </a>
    </div>
  )
}
