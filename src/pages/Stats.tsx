import { useEffect, useMemo, useState } from "react"

type DailyRow = {
  sum?: {
    requests?: number
    bytes?: number
    cachedBytes?: number
  }
  uniq?: {
    uniques?: number
  }
  dimensions?: {
    date?: string
  }
}

type StatsPayload = {
  from: string
  to: string
  totals: {
    requests: number
    bytes: number
    cachedBytes: number
    uniques: number
  }
  daily: DailyRow[]
}

const STATS_API_URL = "https://stats-api.braje.sh"

const formatNumber = (value: number) => new Intl.NumberFormat().format(value)
const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`))

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB", "TB"]
  let current = bytes / 1024
  let unitIndex = 0
  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024
    unitIndex += 1
  }
  return `${current.toFixed(1)} ${units[unitIndex]}`
}

export default function Stats() {
  const [data, setData] = useState<StatsPayload | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(STATS_API_URL, {
          method: "GET",
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`API request failed (${response.status})`)
        }

        const payload = (await response.json()) as StatsPayload
        setData(payload)
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        setError("Failed to load traffic data.")
      } finally {
        setLoading(false)
      }
    }

    loadStats()

    return () => controller.abort()
  }, [])

  const cacheRatio = useMemo(() => {
    if (!data || data.totals.bytes === 0) return 0
    return Math.round((data.totals.cachedBytes / data.totals.bytes) * 100)
  }, [data])

  const dailyRows = useMemo(() => {
    if (!data) return []
    return [...data.daily].sort((a, b) => (b.dimensions?.date ?? "").localeCompare(a.dimensions?.date ?? ""))
  }, [data])

  const maxRequests = useMemo(() => {
    if (!dailyRows.length) return 0
    return dailyRows.reduce((max, row) => Math.max(max, row.sum?.requests ?? 0), 0)
  }, [dailyRows])

  const avgRequests = useMemo(() => {
    if (!dailyRows.length) return 0
    return Math.round(data ? data.totals.requests / dailyRows.length : 0)
  }, [data, dailyRows])

  return (
    <div className="stats-page">
      <section className="stats-hero">
        <p className="stats-kicker">Cloudflare Analytics</p>
        <h1 className="stats-title">Traffic Stats</h1>
        <p className="stats-subtitle">Edge traffic for the last 7 days.</p>
      </section>

      {loading && <p className="stats-status">Loading traffic data...</p>}
      {error && <p className="stats-status stats-status-error">{error}</p>}

      {!loading && !error && data && (
        <>
          <p className="stats-range">
            {data.from} to {data.to}
          </p>

          <div className="stats-metrics">
            <div className="stats-card">
              <p className="stats-card-label">Requests</p>
              <p className="stats-card-value">{formatNumber(data.totals.requests)}</p>
            </div>
            <div className="stats-card">
              <p className="stats-card-label">Unique Visitors</p>
              <p className="stats-card-value">{formatNumber(data.totals.uniques)}</p>
            </div>
            <div className="stats-card">
              <p className="stats-card-label">Total Transfer</p>
              <p className="stats-card-value">{formatBytes(data.totals.bytes)}</p>
            </div>
            <div className="stats-card">
              <p className="stats-card-label">Cache Ratio</p>
              <p className="stats-card-value">{cacheRatio}%</p>
            </div>
            <div className="stats-card">
              <p className="stats-card-label">Avg Requests / Day</p>
              <p className="stats-card-value">{formatNumber(avgRequests)}</p>
            </div>
          </div>

          <div className="stats-table-wrap">
            <div className="stats-table-title-row">
              <h2>Daily Breakdown</h2>
              <span>{dailyRows.length} days</span>
            </div>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Requests</th>
                  <th>Visitors</th>
                  <th>Transfer</th>
                </tr>
              </thead>
              <tbody>
                {dailyRows.map((row) => {
                  const requests = row.sum?.requests ?? 0
                  const barWidth = maxRequests > 0 ? Math.max(6, Math.round((requests / maxRequests) * 100)) : 0
                  return (
                  <tr key={row.dimensions?.date ?? "unknown"}>
                    <td>{row.dimensions?.date ? formatDate(row.dimensions.date) : "-"}</td>
                    <td className="stats-request-cell">
                      <span className="stats-request-value">{formatNumber(requests)}</span>
                      <span className="stats-request-track">
                        <span className="stats-request-bar" style={{ width: `${barWidth}%` }} />
                      </span>
                    </td>
                    <td className="stats-align-right">
                      {formatNumber(row.uniq?.uniques ?? 0)}
                    </td>
                    <td className="stats-align-right">
                      {formatBytes(row.sum?.bytes ?? 0)}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
