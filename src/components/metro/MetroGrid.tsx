import React, { Suspense, useLayoutEffect, useRef, useState } from "react"
import { tileRows, MetroTile as TileType } from "../../data/tiles"
import MetroTile from "./MetroTile"
import { motion } from "framer-motion"
import MetroWindow from "./MetroWindow"

const pages = import.meta.glob("../../pages/**/*.tsx") as Record<string, () => Promise<any>>

const fileToSlug = (filePath: string) => {
  const relative = filePath.replace(/^\.\.\/\.\.\/pages\/?/, "")
  const parts = relative.split("/").map((p) => p.replace(/\.tsx$/, ""))
  if (parts[parts.length - 1] === "index") parts.pop()
  const slug = parts.length === 0 ? "/" : "/" + parts.join("/").toLowerCase()
  return slug
}

type WindowRect = { left: number; top: number; width: number; height: number }
type WindowItem = {
  id: string
  slug: string
  title: string
  Component?: React.LazyExoticComponent<React.ComponentType<any>>
  rect: WindowRect
  z: number
}

const MetroGrid = () => {
  const viewportRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [barInnerWidth, setBarInnerWidth] = useState(0)
  const [iconSize, setIconSize] = useState(20)
  const [windows, setWindows] = useState<WindowItem[]>([])
  const zCounter = useRef(1)

  useLayoutEffect(() => {
    const readMu = () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue("--mu")
      const mu = parseFloat(value || "120")
      return Number.isFinite(mu) ? mu : 120
    }

    const updateIconSize = () => {
      const mu = readMu()
      setIconSize(Math.max(18, Math.round(mu * 0.55)))
    }

    updateIconSize()
    window.addEventListener("resize", updateIconSize)

    return () => {
      window.removeEventListener("resize", updateIconSize)
    }
  }, [])

  const pageLoaders = useRef<Record<string, () => Promise<any>> | null>(null)
  if (!pageLoaders.current) {
    const map: Record<string, () => Promise<any>> = {}
    Object.keys(pages).forEach((p) => {
      const slug = fileToSlug(p)
      map[slug] = pages[p]
    })
    pageLoaders.current = map
  }

  const makeDefaultRect = (index: number): WindowRect => {
    const topBarHeight = 56
    const width = Math.min(window.innerWidth * 0.92, 980)
    const availableHeight = window.innerHeight - topBarHeight
    const height = Math.min(availableHeight * 0.72, 820)
    const baseLeft = Math.round((window.innerWidth - width) / 2)
    const baseTop = Math.round(topBarHeight + (availableHeight - height) / 2)
    const offset = (index % 6) * 24
    const left = Math.min(window.innerWidth - width - 12, baseLeft + offset)
    const top = Math.min(window.innerHeight - height - 12, baseTop + offset)
    return { left: Math.max(12, left), top: Math.max(topBarHeight + 12, top), width, height }
  }

  const openWindow = (tile: TileType) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.slug === tile.slug)
      if (existing) {
        const nextZ = zCounter.current++
        return prev.map((w) => (w.slug === tile.slug ? { ...w, z: nextZ } : w))
      }
      const nextZ = zCounter.current++
      const rect = makeDefaultRect(prev.length)
      const loader = pageLoaders.current?.[tile.slug]
      const Component = loader ? React.lazy(loader) : undefined
      const id = `${tile.id}-${Date.now()}`
      return [
        ...prev,
        {
          id,
          slug: tile.slug,
          title: tile.title,
          Component,
          rect,
          z: nextZ,
        },
      ]
    })
  }

  const updateWindowRect = (id: string, rect: WindowRect) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, rect } : w)))
  }

  const focusWindow = (id: string) => {
    const nextZ = zCounter.current++
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, z: nextZ } : w)))
  }

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }

  // Sync the fixed bottom scrollbar with the scroll container
  useLayoutEffect(() => {
    const scroll = scrollRef.current
    const bar = barRef.current
    if (!scroll || !bar) return

    const update = () => {
      setBarInnerWidth(scroll.scrollWidth)
      bar.scrollLeft = scroll.scrollLeft
    }

    const onScroll = () => {
      if (bar) bar.scrollLeft = scroll.scrollLeft
    }

    const onBarScroll = () => {
      if (scroll) scroll.scrollLeft = bar.scrollLeft
    }

    update()
    scroll.addEventListener("scroll", onScroll)
    bar.addEventListener("scroll", onBarScroll)
    window.addEventListener("resize", update)

    return () => {
      scroll.removeEventListener("scroll", onScroll)
      bar.removeEventListener("scroll", onBarScroll)
      window.removeEventListener("resize", update)
    }
  }, [scrollRef, barRef])

  return (
    <div className="metro-viewport-wrapper">
      <div className="metro-top-gap" />

      <div ref={viewportRef} className="metro-viewport">
        {/* This is now the scroll container */}
        <motion.div
          ref={scrollRef}
          className="metro-scroll"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
          }}
          initial="hidden"
          animate="visible"
        >
          {tileRows.map((row) => (
            <div className="metro-row" key={row.id}>
              {row.groups.map((group) => (
                <div
                  key={group.id}
                  className="metro-group"
                  style={{
                    gridTemplateColumns: `repeat(${group.columns}, var(--mu))`,
                  }}
                  data-columns={group.columns}
                >
                  {group.tiles.map((tile) => (
                    <MetroTile
                      key={tile.id}
                      tile={tile}
                      iconSize={iconSize}
                      onOpen={openWindow}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

        {/* fixed bottom scrollbar synced with metro scroll */}
        <div ref={barRef} className="metro-scrollbar" aria-hidden>
          <div className="metro-scrollbar-inner" style={{ width: barInnerWidth }} />
        </div>

        <div className="metro-bottom-gap" />

        <div className="metro-window-stack">
          {windows.map((win) => (
            <MetroWindow
              key={win.id}
              id={win.id}
              title={win.title}
              rect={win.rect}
              z={win.z}
              onFocus={focusWindow}
              onClose={closeWindow}
              onRectChange={updateWindowRect}
            >
              {win.Component ? (
                <Suspense fallback={<div>Loading...</div>}>
                  <win.Component />
                </Suspense>
              ) : (
                <div>Page not found.</div>
              )}
            </MetroWindow>
          ))}
        </div>
    </div>
  )
}

export default MetroGrid
