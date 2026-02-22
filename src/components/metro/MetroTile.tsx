import { MetroTile as Tile, tileSpan } from "../../data/tiles"
import {
  HiOutlineInformationCircle,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineBeaker,
  HiOutlineNewspaper,
} from "react-icons/hi2"
import PageIcon from "../../data/pageIcons2"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"

type Props = {
  tile: Tile
  iconSize: number
  onOpen?: (tile: Tile) => void
}

const iconMap: Record<string, JSX.Element> = {
  About: <HiOutlineInformationCircle />,
  Projects: <HiOutlineBriefcase />,
  Blog: <HiOutlineNewspaper />,
  Resume: <HiOutlineDocumentText />,
  Labs: <HiOutlineBeaker />,
}

const tileVariant = {
  hidden: { opacity: 0, y: 18, scale: 0.995 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
}

type WeatherData = {
  city: string
  temperature: number
  label: string
}

let cachedWeather: WeatherData | null = null
let weatherPromise: Promise<WeatherData | null> | null = null

const weatherLabelByCode = (code: number) => {
  if (code === 0) return "Clear"
  if ([1, 2, 3].includes(code)) return "Cloudy"
  if ([45, 48].includes(code)) return "Fog"
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle"
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain"
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow"
  if ([95, 96, 99].includes(code)) return "Storm"
  return "Weather"
}

const loadWeatherOnce = async () => {
  if (cachedWeather) return cachedWeather
  if (weatherPromise) return weatherPromise

  weatherPromise = (async () => {
    try {
      const locationRes = await fetch("https://ipapi.co/json/")
      if (!locationRes.ok) throw new Error("ip lookup failed")
      const location = (await locationRes.json()) as { city?: string; latitude?: number; longitude?: number }
      if (typeof location.latitude !== "number" || typeof location.longitude !== "number") {
        throw new Error("missing coordinates")
      }

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code`
      )
      if (!weatherRes.ok) throw new Error("weather lookup failed")
      const weatherPayload = (await weatherRes.json()) as {
        current?: { temperature_2m?: number; weather_code?: number }
      }

      const temp = weatherPayload.current?.temperature_2m
      const code = weatherPayload.current?.weather_code
      if (typeof temp !== "number" || typeof code !== "number") throw new Error("bad weather payload")

      cachedWeather = {
        city: location.city || "Local",
        temperature: Math.round(temp),
        label: weatherLabelByCode(code),
      }
      return cachedWeather
    } catch {
      return null
    } finally {
      weatherPromise = null
    }
  })()

  return weatherPromise
}

const MetroTile = ({ tile, iconSize, onOpen }: Props) => {
  const { w, h } = tileSpan(tile.size)
  const liveSocialTiles = new Set(["alpha", "beta", "gamma", "delta"])
  const isLiveTile = tile.id === "stats" || liveSocialTiles.has(tile.id)
  const [clock, setClock] = useState(() => new Date())
  const livePhaseSecond = clock.getSeconds() % 15
  const showLiveIcon = isLiveTile && livePhaseSecond >= 10
  const tileIcon = iconMap[tile.title] ? iconMap[tile.title] : <PageIcon path={tile.slug} size={iconSize} plain />
  const [weather, setWeather] = useState<WeatherData | null>(cachedWeather)

  const handleClick = () => {
    if (!onOpen) return
    onOpen(tile)
  }

  useEffect(() => {
    if (!isLiveTile) return
    const timer = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [isLiveTile])

  useEffect(() => {
    if (tile.id !== "beta") return
    let alive = true
    loadWeatherOnce().then((payload) => {
      if (!alive || !payload) return
      setWeather(payload)
    })
    return () => {
      alive = false
    }
  }, [tile.id])

  const liveWidget = useMemo(() => {
    if (tile.id === "stats") {
      const currentSecond = clock.getSeconds()
      const online = currentSecond % 12 < 10
      const latency = 22 + ((clock.getMinutes() * 60 + currentSecond) % 34)
      return (
        <div className="metro-live-widget">
          <div className="metro-live-pill">
            <span className={`metro-live-dot ${online ? "is-online" : "is-syncing"}`} />
            <span>{online ? "ONLINE" : "SYNCING"}</span>
          </div>
          <div className="metro-live-primary">{latency}ms</div>
          <div className="metro-live-secondary">API latency</div>
        </div>
      )
    }

    if (tile.id === "alpha") {
      return (
        <div className="metro-live-widget metro-live-widget-project">
          <div className="metro-live-project-tag">Local clock</div>
          <div className="metro-live-primary">
            {clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
          </div>
          <div className="metro-live-secondary">
            {clock.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>
      )
    }

    if (tile.id === "beta") {
      return (
        <div className="metro-live-widget metro-live-widget-project">
          <div className="metro-live-project-tag">Weather (IP based)</div>
          <div className="metro-live-primary">{weather ? `${weather.temperature}C` : "--"}</div>
          <div className="metro-live-secondary">{weather ? `${weather.city} - ${weather.label}` : "Loading once..."}</div>
        </div>
      )
    }

    if (tile.id === "gamma") {
      const now = clock
      const dayStart = new Date(now)
      dayStart.setHours(0, 0, 0, 0)
      const dayProgress = Math.min(
        100,
        Math.max(0, Math.round(((now.getTime() - dayStart.getTime()) / (24 * 60 * 60 * 1000)) * 100))
      )
      return (
        <div className="metro-live-widget metro-live-widget-project">
          <div className="metro-live-project-tag">Day progress</div>
          <div className="metro-live-project-line">{dayProgress}% complete</div>
          <div className="metro-live-progress-track">
            <div className="metro-live-progress-fill" style={{ width: `${dayProgress}%` }} />
          </div>
        </div>
      )
    }

    if (tile.id === "delta") {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local"
      const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true
      return (
        <div className="metro-live-widget metro-live-widget-project">
          <div className="metro-live-project-tag">System info</div>
          <div className="metro-live-project-line">{tz}</div>
          <div className="metro-live-secondary">{isOnline ? "Network online" : "Network offline"}</div>
        </div>
      )
    }

    return null
  }, [clock, tile.id, weather])

  return (
    <motion.button
      className="metro-tile"
      variants={tileVariant}
      style={{
        gridColumn: `span ${w}`,
        gridRow: `span ${h}`,
      }}
      type="button"
      aria-label={tile.title}
      onClick={handleClick}
    >
      <div
        className={`metro-tile-surface ${isLiveTile ? "is-live" : ""}`}
        style={{
          backgroundColor: tile.color,
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLiveTile ? (
          <div className={`metro-live-flip ${showLiveIcon ? "is-icon" : "is-widget"}`}>
            <div className="metro-live-face metro-live-face-widget">{liveWidget}</div>
            <div className="metro-live-face metro-live-face-icon">
              <div
                className="metro-tile-icon metro-tile-icon-live-flip"
                style={{
                  fontSize: iconSize,
                  lineHeight: 1,
                }}
              >
                {tileIcon}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="metro-tile-icon"
            style={{
              fontSize: iconSize,
              lineHeight: 1,
            }}
          >
            {tileIcon}
          </div>
        )}

        {/* Title (Metro-style overlay) */}
        <span className={`metro-tile-title ${tile.title.length > 11 ? "is-long" : ""} ${isLiveTile ? "is-live" : ""}`}>
          {tile.title}
        </span>
      </div>
    </motion.button>
  )
}

export default MetroTile
