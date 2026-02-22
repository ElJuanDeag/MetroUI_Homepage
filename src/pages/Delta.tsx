import { useEffect, useMemo, useState } from "react"

type NetworkInfo = {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

type DeviceMemoryNavigator = Navigator & { deviceMemory?: number; connection?: NetworkInfo; mozConnection?: NetworkInfo; webkitConnection?: NetworkInfo }

export default function Delta() {
  const [online, setOnline] = useState<boolean>(() => (typeof navigator !== "undefined" ? navigator.onLine : true))
  const [now, setNow] = useState(() => new Date())
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  }))
  const [storageEstimate, setStorageEstimate] = useState<{ usage?: number; quota?: number } | null>(null)

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight })
    const timer = window.setInterval(() => setNow(new Date()), 1000)

    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
      window.removeEventListener("resize", onResize)
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    const loadStorage = async () => {
      if (!navigator.storage?.estimate) return
      try {
        const estimate = await navigator.storage.estimate()
        setStorageEstimate({ usage: estimate.usage, quota: estimate.quota })
      } catch {
        setStorageEstimate(null)
      }
    }
    loadStorage()
  }, [])

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "Local", [])
  const locale = useMemo(() => Intl.DateTimeFormat().resolvedOptions().locale || "Default", [])
  const nav = navigator as DeviceMemoryNavigator
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection
  const screenInfo = `${window.screen.width}x${window.screen.height}`
  const colorScheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference"
  const touch = navigator.maxTouchPoints > 0 ? `${navigator.maxTouchPoints} touch points` : "no touch"
  const formatBytes = (value?: number) => (typeof value === "number" ? `${(value / (1024 * 1024)).toFixed(1)} MB` : "n/a")

  return (
    <div style={{ padding: 24, height: "100%", display: "grid", gap: 16 }}>
      <div
        style={{
          border: "1px solid rgba(255, 255, 255, 0.2)",
          padding: 18,
          background: "linear-gradient(155deg, rgba(192, 65, 59, 0.32), rgba(7, 20, 38, 0.45), rgba(255,255,255,0.03))",
          display: "grid",
          gap: 10,
          alignContent: "start",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: online ? "#47ff9f" : "#ff6d6d",
              boxShadow: "0 0 12px rgba(255,255,255,0.35)",
            }}
          />
          {online ? "Online" : "Offline"}
        </div>
        <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Timezone: {timezone}</div>
        <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Locale: {locale}</div>
        <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>
          Local time: {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
        </div>
      </div>

      <div
        style={{
          border: "1px solid rgba(255, 255, 255, 0.2)",
          padding: 14,
          background: "rgba(255,255,255,0.03)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
          alignContent: "start",
        }}
      >
        <div style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.16)", padding: 10 }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", opacity: 0.8 }}>Network</div>
          <div>Type: {connection?.effectiveType || "n/a"}</div>
          <div>Downlink: {typeof connection?.downlink === "number" ? `${connection.downlink} Mbps` : "n/a"}</div>
          <div>RTT: {typeof connection?.rtt === "number" ? `${connection.rtt} ms` : "n/a"}</div>
          <div>Save-Data: {typeof connection?.saveData === "boolean" ? (connection.saveData ? "on" : "off") : "n/a"}</div>
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.16)", padding: 10 }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", opacity: 0.8 }}>Hardware</div>
          <div>CPU cores: {navigator.hardwareConcurrency || "n/a"}</div>
          <div>Device memory: {nav.deviceMemory ? `${nav.deviceMemory} GB` : "n/a"}</div>
          <div>DPR: {window.devicePixelRatio}</div>
          <div>Touch: {touch}</div>
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.16)", padding: 10 }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", opacity: 0.8 }}>Display</div>
          <div>Viewport: {viewport.width}x{viewport.height}</div>
          <div>Screen: {screenInfo}</div>
          <div>Color scheme: {colorScheme}</div>
          <div>Motion pref: {reducedMotion}</div>
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.16)", padding: 10 }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", opacity: 0.8 }}>Runtime</div>
          <div>Language: {navigator.language}</div>
          <div>Languages: {navigator.languages?.join(", ") || "n/a"}</div>
          <div>Cookies: {navigator.cookieEnabled ? "enabled" : "disabled"}</div>
          <div>Do Not Track: {navigator.doNotTrack || "unspecified"}</div>
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.16)", padding: 10 }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", opacity: 0.8 }}>Storage</div>
          <div>localStorage: {typeof window.localStorage !== "undefined" ? "available" : "n/a"}</div>
          <div>sessionStorage: {typeof window.sessionStorage !== "undefined" ? "available" : "n/a"}</div>
          <div>Usage: {formatBytes(storageEstimate?.usage)}</div>
          <div>Quota: {formatBytes(storageEstimate?.quota)}</div>
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.16)", padding: 10 }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", opacity: 0.8 }}>Session</div>
          <div>URL: {window.location.href}</div>
          <div>Referrer: {document.referrer || "direct"}</div>
          <div>History length: {window.history.length}</div>
          <div>User agent: {navigator.userAgent}</div>
        </div>
      </div>
    </div>
  )
}
