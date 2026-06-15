import { useEffect, useState } from "react"

const CONSENT_KEY = "metro_consent_v1"

type ConsentValue = "accepted" | "essential"

export function hasAnalyticsConsent() {
  return localStorage.getItem(CONSENT_KEY) === "accepted"
}

export default function ConsentBanner() {
  const [choice, setChoice] = useState<ConsentValue | null>(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    return stored === "accepted" || stored === "essential" ? stored : null
  })

  useEffect(() => {
    if (!choice) return
    localStorage.setItem(CONSENT_KEY, choice)
    window.dispatchEvent(new CustomEvent("metro-consent-change", { detail: choice }))
  }, [choice])

  if (choice) return null

  return (
    <aside className="consent-banner" aria-label="Privacy choices">
      <div>
        <strong>Privacy controls</strong>
        <p>
          This site uses essential browser storage for UI features. Optional
          analytics only run after consent.
        </p>
      </div>
      <div className="consent-actions">
        <button type="button" onClick={() => setChoice("essential")}>
          Essential Only
        </button>
        <button type="button" className="is-primary" onClick={() => setChoice("accepted")}>
          Allow Analytics
        </button>
      </div>
    </aside>
  )
}
