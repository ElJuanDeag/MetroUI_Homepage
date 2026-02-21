export default function Beta(){
  const pageUrl = encodeURIComponent("https://www.facebook.com/theBrajeshKumar")
  return (
    <div style={{ padding: 24, height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <h1>Facebook</h1>
      <div style={{ flex: 1, minHeight: 420, border: "1px solid rgba(255, 255, 255, 0.2)" }}>
        <iframe
          src={`https://www.facebook.com/plugins/page.php?href=${pageUrl}&tabs=timeline&width=1000&height=720&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
          title="Facebook Preview"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
      <a href="https://www.facebook.com/theBrajeshKumar" target="_blank" rel="noreferrer">
        Open Profile
      </a>
    </div>
  )
}
