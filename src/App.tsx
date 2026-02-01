import React, { Suspense } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import TopBar from "./components/TopBar"
import MetroGrid from "./components/metro/MetroGrid"
import PageShell from "./components/PageShell"

// Dynamically import all page components under ./pages (Vite)
const pages = (import.meta as any).glob("./pages/**/*.tsx") as Record<string, () => Promise<any>>

const fileToSlug = (filePath: string) => {
  // filePath examples: './pages/About.tsx' or './pages/profile/index.tsx'
  const relative = filePath.replace(/^\.\/pages\/?/, "")
  const parts = relative.split("/").map((p) => p.replace(/\.tsx$/, ""))
  // handle index files as their parent folder
  if (parts[parts.length - 1] === "index") parts.pop()
  const slug = parts.length === 0 ? "/" : "/" + parts.join("/").toLowerCase()
  return slug
}

const InnerRoutes = () => {
  const location = useLocation()
  return (
    <div className="app-root">
      <TopBar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* keep the MetroGrid as the root landing */}
          <Route path="/" element={<MetroGrid />} />

          {/* auto-register pages found in ./pages (excluding root index behaviour) */}
          {Object.keys(pages).map((p) => {
            const slug = fileToSlug(p)
            if (slug === "/") return null
            const LazyPage = React.lazy(pages[p])

            const parts = p.replace(/^\.\/pages\/?/, "").replace(/\.tsx$/, "").split("/")
            if (parts[parts.length - 1] === "index") parts.pop()
            const title = parts.length === 0 ? "" : parts.map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())).join(" / ")

            return (
              <Route
                key={slug}
                path={slug}
                element={
                  <Suspense fallback={<PageShell title={title} path={slug}><div style={{ padding: 24 }}>Loading…</div></PageShell>}>
                    <PageShell title={title} path={slug}>
                      <LazyPage />
                    </PageShell>
                  </Suspense>
                }
              />
            )
          })}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <InnerRoutes />
    </BrowserRouter>
  )
}

// Note: profile pages (src/pages/profile/*.tsx) are auto-registered by the
// import.meta.glob mapping above and will be wrapped by PageShell automatically.

function NotFound(){
  return (
    <PageShell>
      <div style={{ padding: 24 }}>
        <h1>Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
      </div>
    </PageShell>
  )
}

export default App
