import { useEffect, useMemo, useState } from "react"

export default function Alpha() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "Local", [])
  const worldZones = useMemo(
    () => [
      { label: "Tokyo", zone: "Asia/Tokyo" },
      { label: "HKG", zone: "Asia/Hong_Kong" },
      { label: "IST", zone: "Asia/Kolkata" },
      { label: "UTC", zone: "UTC" },
      { label: "NYT", zone: "America/New_York" },
    ],
    []
  )

  return (
    <div style={{ padding: 24, height: "100%", display: "grid", gap: 16 }}>
      <div
        style={{
          border: "1px solid rgba(255, 255, 255, 0.2)",
          padding: 18,
          background: "linear-gradient(155deg, rgba(52, 190, 194, 0.2), rgba(255,255,255,0.04))",
          display: "grid",
          gap: 10,
          alignContent: "start",
        }}
      >
        <div style={{ fontSize: "0.82rem", letterSpacing: "0.7px", textTransform: "uppercase", opacity: 0.8 }}>
          Local time
        </div>
        <div style={{ fontSize: "clamp(2.2rem, 8vw, 4rem)", fontWeight: 700, lineHeight: 1 }}>
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
        </div>
        <div style={{ fontSize: "1.1rem", opacity: 0.95 }}>
          {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </div>
        <div style={{ fontSize: "0.9rem", opacity: 0.82 }}>Timezone: {timezone}</div>
      </div>

      <div
        style={{
          border: "1px solid rgba(255, 255, 255, 0.2)",
          padding: 14,
          background: "rgba(255,255,255,0.03)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
        }}
      >
        {worldZones.map((z) => (
          <div
            key={z.zone}
            style={{
              border: "1px solid rgba(255, 255, 255, 0.14)",
              background: "rgba(0,0,0,0.14)",
              padding: 10,
              display: "grid",
              gap: 6,
            }}
          >
            <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.7px", opacity: 0.82 }}>
              {z.label}
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
              {new Intl.DateTimeFormat([], {
                timeZone: z.zone,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              }).format(now)}
            </div>
            <div style={{ fontSize: "0.74rem", opacity: 0.75 }}>
              {new Intl.DateTimeFormat([], { timeZone: z.zone, weekday: "short", month: "short", day: "numeric" }).format(now)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
