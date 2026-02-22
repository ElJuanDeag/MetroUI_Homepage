import { useEffect, useMemo, useState } from "react"

type DayCycleData = {
  city: string
  sunrise: string
  sunset: string
  tideNow: number
  tideTrend: "Rising" | "Falling" | "Stable"
  nextHigh: string
  nextLow: string
}

const formatHm = (value: string) => new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })

const findExtrema = (times: string[], values: number[], nowMs: number, lookForHigh: boolean) => {
  for (let i = 1; i < values.length - 1; i += 1) {
    const prev = values[i - 1]
    const current = values[i]
    const next = values[i + 1]
    const isPeak = lookForHigh ? current >= prev && current >= next : current <= prev && current <= next
    if (!isPeak) continue
    const timeMs = new Date(times[i]).getTime()
    if (timeMs >= nowMs) return times[i]
  }
  return null
}

export default function Gamma() {
  const [now, setNow] = useState(() => new Date())
  const [cycleData, setCycleData] = useState<DayCycleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    const loadDayCycle = async () => {
      try {
        setLoading(true)
        setError(null)

        const locationRes = await fetch("https://ipapi.co/json/", { signal: controller.signal })
        if (!locationRes.ok) throw new Error("Location lookup failed")
        const location = (await locationRes.json()) as {
          city?: string
          latitude?: number
          longitude?: number
        }

        if (typeof location.latitude !== "number" || typeof location.longitude !== "number") {
          throw new Error("Coordinates unavailable")
        }

        const sunRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=sunrise,sunset&forecast_days=1&timezone=auto`,
          { signal: controller.signal }
        )
        if (!sunRes.ok) throw new Error("Sun data lookup failed")
        const sunPayload = (await sunRes.json()) as { daily?: { sunrise?: string[]; sunset?: string[] } }
        const sunriseRaw = sunPayload.daily?.sunrise?.[0]
        const sunsetRaw = sunPayload.daily?.sunset?.[0]
        if (typeof sunriseRaw !== "string" || typeof sunsetRaw !== "string") {
          throw new Error("Missing sunrise/sunset")
        }

        const tideRes = await fetch(
          `https://marine-api.open-meteo.com/v1/marine?latitude=${location.latitude}&longitude=${location.longitude}&hourly=tide_height&forecast_days=2&timezone=auto`,
          { signal: controller.signal }
        )
        if (!tideRes.ok) throw new Error("Tide data lookup failed")
        const tidePayload = (await tideRes.json()) as {
          hourly?: { time?: string[]; tide_height?: number[] }
        }

        const tideTimes = tidePayload.hourly?.time || []
        const tideValues = tidePayload.hourly?.tide_height || []
        if (!tideTimes.length || !tideValues.length || tideTimes.length !== tideValues.length) {
          throw new Error("No tide data for this location")
        }

        const nowMs = Date.now()
        let nearestIndex = 0
        for (let i = 1; i < tideTimes.length; i += 1) {
          const currentDelta = Math.abs(new Date(tideTimes[i]).getTime() - nowMs)
          const nearestDelta = Math.abs(new Date(tideTimes[nearestIndex]).getTime() - nowMs)
          if (currentDelta < nearestDelta) nearestIndex = i
        }

        const prev = tideValues[Math.max(0, nearestIndex - 1)]
        const next = tideValues[Math.min(tideValues.length - 1, nearestIndex + 1)]
        const diff = next - prev
        const tideTrend: DayCycleData["tideTrend"] = Math.abs(diff) < 0.02 ? "Stable" : diff > 0 ? "Rising" : "Falling"

        const nextHigh = findExtrema(tideTimes, tideValues, nowMs, true)
        const nextLow = findExtrema(tideTimes, tideValues, nowMs, false)

        if (!active) return
        setCycleData({
          city: location.city || "Local",
          sunrise: formatHm(sunriseRaw),
          sunset: formatHm(sunsetRaw),
          tideNow: Number(tideValues[nearestIndex].toFixed(2)),
          tideTrend,
          nextHigh: nextHigh ? formatHm(nextHigh) : "N/A",
          nextLow: nextLow ? formatHm(nextLow) : "N/A",
        })
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        if (!active) return
        setError("Could not load sunrise/sunset or tide data for your location.")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDayCycle()

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  const { dayProgress, elapsed, remaining } = useMemo(() => {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    const next = new Date(start)
    next.setDate(next.getDate() + 1)

    const totalMs = next.getTime() - start.getTime()
    const elapsedMs = now.getTime() - start.getTime()
    const remainingMs = Math.max(0, totalMs - elapsedMs)

    const toHm = (ms: number) => {
      const totalMinutes = Math.floor(ms / 60000)
      const h = Math.floor(totalMinutes / 60)
      const m = totalMinutes % 60
      return `${h}h ${m}m`
    }

    return {
      dayProgress: Math.round((elapsedMs / totalMs) * 100),
      elapsed: toHm(elapsedMs),
      remaining: toHm(remainingMs),
    }
  }, [now])

  return (
    <div style={{ padding: 24, height: "100%", display: "grid", gap: 16 }}>
      <div
        style={{
          border: "1px solid rgba(255, 255, 255, 0.2)",
          padding: 18,
          background: "linear-gradient(150deg, rgba(255, 170, 12, 0.24), rgba(13, 33, 55, 0.35), rgba(255,255,255,0.03))",
          display: "grid",
          gap: 12,
          alignContent: "start",
        }}
      >
        <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.75px", opacity: 0.8 }}>
          Daily cycle
        </div>
        <div style={{ fontSize: "clamp(2rem, 6vw, 3.4rem)", fontWeight: 700, lineHeight: 1 }}>{dayProgress}%</div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 999, overflow: "hidden" }}>
          <div
            style={{
              width: `${Math.min(100, Math.max(0, dayProgress))}%`,
              height: "100%",
              background: "linear-gradient(90deg, #d8fbff, #7be6ff)",
            }}
          />
        </div>
        <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Elapsed: {elapsed}</div>
        <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Remaining: {remaining}</div>
      </div>

      <div
        style={{
          border: "1px solid rgba(255, 255, 255, 0.2)",
          padding: 14,
          background: "rgba(255,255,255,0.03)",
          display: "grid",
          gap: 10,
          alignContent: "start",
        }}
      >
        {loading && <p style={{ margin: 0 }}>Loading sun and tide data...</p>}
        {error && <p style={{ margin: 0, color: "#ffd2d2" }}>{error}</p>}
        {!loading && !error && cycleData && (
          <>
            <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>Location: {cycleData.city}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
              <div style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.16)", padding: 10 }}>
                <div style={{ fontSize: "0.74rem", opacity: 0.8, textTransform: "uppercase" }}>Sunrise</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{cycleData.sunrise}</div>
              </div>
              <div style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.16)", padding: 10 }}>
                <div style={{ fontSize: "0.74rem", opacity: 0.8, textTransform: "uppercase" }}>Sunset</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{cycleData.sunset}</div>
              </div>
              <div style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.16)", padding: 10 }}>
                <div style={{ fontSize: "0.74rem", opacity: 0.8, textTransform: "uppercase" }}>Tide now</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{cycleData.tideNow} m</div>
                <div style={{ fontSize: "0.8rem", opacity: 0.84 }}>{cycleData.tideTrend}</div>
              </div>
              <div style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.16)", padding: 10 }}>
                <div style={{ fontSize: "0.74rem", opacity: 0.8, textTransform: "uppercase" }}>Next high / low</div>
                <div style={{ fontSize: "1.05rem", fontWeight: 600 }}>{cycleData.nextHigh}</div>
                <div style={{ fontSize: "1.05rem", fontWeight: 600 }}>{cycleData.nextLow}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
