import { useLayoutEffect, useRef, useState } from "react"
import { tileRows, MetroTile as TileType } from "../../data/tiles"
import MetroTile from "./MetroTile"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"

const MetroGrid = () => {
  const viewportRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [barInnerWidth, setBarInnerWidth] = useState(0)
  const [active, setActive] = useState<null | { tile: TileType; rect: DOMRect }>(null)
  const navigate = useNavigate()

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const updateMU = () => {
      const h = viewport.clientHeight
      const mu = Math.floor(h / 4)
      document.documentElement.style.setProperty("--mu", `${mu}px`)
    }

    updateMU()
    window.addEventListener("resize", updateMU)

    return () => {
      window.removeEventListener("resize", updateMU)
    }
  }, [])

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
        {/* 🔑 THIS is now the scroll container */}
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
                >
                  {group.tiles.map((tile) => (
                    <MetroTile key={tile.id} tile={tile} onOpen={(t, r) => setActive({ tile: t, rect: r })} />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </motion.div>
        <AnimatePresence>
          {active && (
            <motion.div
              className="metro-overlay"
              style={{ backgroundColor: active.tile.color }}
              initial={{
                left: active.rect.left,
                top: active.rect.top,
                width: active.rect.width,
                height: active.rect.height,
                borderRadius: 6,
                rotateY: 0,
                opacity: 1,
              }}
              animate={{
                left: 0,
                top: 0,
                width: window.innerWidth,
                height: window.innerHeight,
                borderRadius: 0,
                rotateY: [0, 90, 0],
                opacity: 1,
              }}
              exit={{
                left: active.rect.left,
                top: active.rect.top,
                width: active.rect.width,
                height: active.rect.height,
                rotateY: 0,
              }}
              transition={{ duration: 0.9, times: [0, 0.5, 1], type: "spring", stiffness: 500, damping: 40 }}
              onClick={() => setActive(null)}
              onAnimationComplete={() => {
                // navigate to tile page after the flip finishes
                const slug = active.tile.title.toLowerCase().replace(/\s+/g, "-")
                // navigate to the page corresponding to the tile
                navigate(`/${slug}`)
                setActive(null)
              }}
            >
              <div className="metro-overlay-inner" style={{ background: "transparent" }}>
                <div className="metro-overlay-icon">
                  <span className="overlay-title">{active.tile.title}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* fixed bottom scrollbar synced with metro scroll */}
        <div ref={barRef} className="metro-scrollbar" aria-hidden>
          <div className="metro-scrollbar-inner" style={{ width: barInnerWidth }} />
        </div>

        <div className="metro-bottom-gap" />
    </div>
  )
}

export default MetroGrid
