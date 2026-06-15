import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { hasAnalyticsConsent } from "./ConsentBanner"
import { requestJson } from "../lib/api"

export default function AnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    if (!hasAnalyticsConsent()) return

    requestJson<{ ok: boolean }>("/api/analytics/event", {
      method: "POST",
      body: JSON.stringify({
        path: location.pathname,
        referrer: document.referrer || null,
        title: document.title,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Analytics should never affect browsing.
    })
  }, [location.pathname])

  return null
}
