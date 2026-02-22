import { useEffect, useState } from "react"

type WeatherData = {
  city: string
  country: string
  timezone: string
  tempC: number
  feelsLikeC: number
  weatherCode: number
  humidity: number
  windKph: number
  windDir: number
  rainChance: number
  uvIndex: number
  sunrise: string
  sunset: string
}

const weatherLabel = (code: number) => {
  if (code === 0) return "Clear sky"
  if ([1, 2, 3].includes(code)) return "Partly cloudy"
  if ([45, 48].includes(code)) return "Fog"
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle"
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain"
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow"
  if ([95, 96, 99].includes(code)) return "Thunderstorm"
  return "Weather update"
}

export default function Beta() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<WeatherData | null>(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    const loadWeather = async () => {
      try {
        setLoading(true)
        setError(null)

        const locationRes = await fetch("https://ipapi.co/json/", { signal: controller.signal })
        if (!locationRes.ok) throw new Error("Location lookup failed")
        const location = (await locationRes.json()) as {
          city?: string
          country_name?: string
          latitude?: number
          longitude?: number
        }

        if (typeof location.latitude !== "number" || typeof location.longitude !== "number") {
          throw new Error("Coordinates unavailable")
        }

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset,uv_index_max,precipitation_probability_max&forecast_days=1&timezone=auto`,
          { signal: controller.signal }
        )
        if (!weatherRes.ok) throw new Error("Weather API failed")
        const weatherPayload = (await weatherRes.json()) as {
          timezone?: string
          current?: {
            temperature_2m?: number
            apparent_temperature?: number
            weather_code?: number
            relative_humidity_2m?: number
            wind_speed_10m?: number
            wind_direction_10m?: number
          }
          daily?: {
            sunrise?: string[]
            sunset?: string[]
            uv_index_max?: number[]
            precipitation_probability_max?: number[]
          }
        }

        const tempC = weatherPayload.current?.temperature_2m
        const feelsLikeC = weatherPayload.current?.apparent_temperature
        const weatherCode = weatherPayload.current?.weather_code
        const humidity = weatherPayload.current?.relative_humidity_2m
        const windKph = weatherPayload.current?.wind_speed_10m
        const windDir = weatherPayload.current?.wind_direction_10m
        const rainChance = weatherPayload.daily?.precipitation_probability_max?.[0]
        const uvIndex = weatherPayload.daily?.uv_index_max?.[0]
        const sunriseRaw = weatherPayload.daily?.sunrise?.[0]
        const sunsetRaw = weatherPayload.daily?.sunset?.[0]

        if (
          typeof tempC !== "number" ||
          typeof feelsLikeC !== "number" ||
          typeof weatherCode !== "number" ||
          typeof humidity !== "number" ||
          typeof windKph !== "number" ||
          typeof windDir !== "number" ||
          typeof rainChance !== "number" ||
          typeof uvIndex !== "number" ||
          typeof sunriseRaw !== "string" ||
          typeof sunsetRaw !== "string"
        ) {
          throw new Error("Malformed weather payload")
        }

        const sunrise = new Date(sunriseRaw).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
        const sunset = new Date(sunsetRaw).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })

        if (!active) return
        setData({
          city: location.city || "Local",
          country: location.country_name || "",
          timezone: weatherPayload.timezone || "Local",
          tempC: Math.round(tempC),
          feelsLikeC: Math.round(feelsLikeC),
          weatherCode,
          humidity: Math.round(humidity),
          windKph: Math.round(windKph),
          windDir: Math.round(windDir),
          rainChance: Math.round(rainChance),
          uvIndex: Math.round(uvIndex),
          sunrise,
          sunset,
        })
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        if (!active) return
        setError("Could not load weather from your IP location.")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadWeather()

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  return (
    <div style={{ padding: 24, height: "100%", display: "grid", gap: 16 }}>
      <div
        style={{
          border: "1px solid rgba(255, 255, 255, 0.2)",
          padding: 18,
          background: "linear-gradient(150deg, rgba(67, 130, 220, 0.3), rgba(8, 27, 55, 0.45), rgba(255,255,255,0.03))",
          display: "grid",
          gap: 12,
          alignContent: "start",
        }}
      >
        {loading && <p style={{ margin: 0 }}>Loading weather...</p>}
        {error && <p style={{ margin: 0, color: "#ffd2d2" }}>{error}</p>}
        {!loading && !error && data && (
          <>
            <div style={{ display: "grid", gap: 4 }}>
              <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.75px", opacity: 0.82 }}>
                Current conditions
              </div>
              <div style={{ fontSize: "clamp(2rem, 7vw, 3.8rem)", fontWeight: 700, lineHeight: 1 }}>{data.tempC}C</div>
              <div style={{ fontSize: "1rem", opacity: 0.95 }}>{weatherLabel(data.weatherCode)}</div>
              <div style={{ fontSize: "0.88rem", opacity: 0.84 }}>
                Feels like {data.feelsLikeC}C | UV {data.uvIndex} | Rain chance {data.rainChance}%
              </div>
            </div>

            <div style={{ fontSize: "0.9rem", opacity: 0.84 }}>
              {data.city}
              {data.country ? `, ${data.country}` : ""}
              {" | "}
              {data.timezone}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              <div style={{ border: "1px solid rgba(255,255,255,0.16)", background: "rgba(0,0,0,0.18)", padding: 10 }}>
                <div style={{ fontSize: "0.75rem", opacity: 0.8, textTransform: "uppercase" }}>Humidity</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{data.humidity}%</div>
              </div>
              <div style={{ border: "1px solid rgba(255,255,255,0.16)", background: "rgba(0,0,0,0.18)", padding: 10 }}>
                <div style={{ fontSize: "0.75rem", opacity: 0.8, textTransform: "uppercase" }}>Wind</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{data.windKph} km/h</div>
                <div style={{ fontSize: "0.8rem", opacity: 0.84 }}>Direction {data.windDir} deg</div>
              </div>
              <div style={{ border: "1px solid rgba(255,255,255,0.16)", background: "rgba(0,0,0,0.18)", padding: 10 }}>
                <div style={{ fontSize: "0.75rem", opacity: 0.8, textTransform: "uppercase" }}>Sunrise</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{data.sunrise}</div>
              </div>
              <div style={{ border: "1px solid rgba(255,255,255,0.16)", background: "rgba(0,0,0,0.18)", padding: 10 }}>
                <div style={{ fontSize: "0.75rem", opacity: 0.8, textTransform: "uppercase" }}>Sunset</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{data.sunset}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
