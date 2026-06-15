import { useEffect } from "react"

type MetaInput = {
  title: string
  description: string
  path?: string
}

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://braje.sh"

const upsertMeta = (selector: string, attrs: Record<string, string>) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null
  if (!element) {
    element = selector.startsWith("link") ? document.createElement("link") : document.createElement("meta")
    document.head.appendChild(element)
  }
  Object.entries(attrs).forEach(([key, value]) => element?.setAttribute(key, value))
}

export function usePageMeta({ title, description, path = "/" }: MetaInput) {
  useEffect(() => {
    const fullTitle = title === "BRAJE.sh" ? title : `${title} | BRAJE.sh`
    const canonical = `${SITE_URL}${path === "/" ? "" : path}`

    document.title = fullTitle
    upsertMeta('meta[name="description"]', { name: "description", content: description })
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle })
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description })
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" })
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical })
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary" })
    upsertMeta('link[rel="canonical"]', { rel: "canonical", href: canonical })
  }, [description, path, title])
}
