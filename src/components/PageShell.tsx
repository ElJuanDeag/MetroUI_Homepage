import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiChevronLeft, FiChevronRight, FiGrid, FiMaximize, FiMinimize } from "react-icons/fi"
import PageIcon, { getColorForPath } from "../data/pageIcons2"
import { motion } from "framer-motion"

type Props = {
  children: ReactNode
  title?: string
  path?: string
}

const PageShell = ({ children, title, path }: Props) => {
  const navigate = useNavigate()
  const colorHex = getColorForPath(path)
  const topBarHeight = 56
  const windowRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; originW: number; originH: number } | null>(null)

  const defaultSize = useMemo(() => {
    const width = Math.min(window.innerWidth * 0.92, 980)
    const availableHeight = window.innerHeight - topBarHeight
    const height = Math.min(availableHeight * 0.72, 820)
    const left = Math.round((window.innerWidth - width) / 2)
    const top = Math.round(topBarHeight + (availableHeight - height) / 2)
    return { left, top, width, height }
  }, [])

  const [rect, setRect] = useState(defaultSize)
  const [isMaximized, setIsMaximized] = useState(false)
  const previousRect = useRef(defaultSize)

  useEffect(() => {
    const onResize = () => {
      if (isMaximized) {
        setRect({
          left: 12,
          top: topBarHeight + 12,
          width: window.innerWidth - 24,
          height: window.innerHeight - topBarHeight - 24,
        })
        return
      }
      const width = Math.min(window.innerWidth * 0.92, 980)
      const availableHeight = window.innerHeight - topBarHeight
      const height = Math.min(availableHeight * 0.72, 820)
      const left = Math.round((window.innerWidth - width) / 2)
      const top = Math.round(topBarHeight + (availableHeight - height) / 2)
      setRect({ left, top, width, height })
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [isMaximized])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current && !isMaximized) {
        const { startX, startY, originX, originY } = dragRef.current
        const nextLeft = originX + (e.clientX - startX)
        const nextTop = originY + (e.clientY - startY)
        const maxLeft = window.innerWidth - rect.width - 12
        const maxTop = window.innerHeight - rect.height - 12
        setRect((prev) => ({
          ...prev,
          left: Math.max(12, Math.min(maxLeft, nextLeft)),
          top: Math.max(topBarHeight + 12, Math.min(maxTop, nextTop)),
        }))
      }
      if (resizeRef.current && !isMaximized) {
        const { startX, startY, originW, originH } = resizeRef.current
        const minW = 520
        const minH = 320
        const maxW = window.innerWidth - rect.left - 12
        const maxH = window.innerHeight - rect.top - 12
        const nextW = Math.min(maxW, Math.max(minW, originW + (e.clientX - startX)))
        const nextH = Math.min(maxH, Math.max(minH, originH + (e.clientY - startY)))
        setRect((prev) => ({ ...prev, width: nextW, height: nextH }))
      }
    }
    const onUp = () => {
      dragRef.current = null
      resizeRef.current = null
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [isMaximized, rect.height, rect.left, rect.top, rect.width])

  return (
    <div
      className="page-shell"
      style={{
        ['--page-color' as any]: colorHex,
      }}
    >
      <div
        ref={windowRef}
        className="page-shell-window"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
      >
        <header
          className="page-shell-header"
          onMouseDown={(e) => {
            const target = e.target as HTMLElement
            if (target.closest(".page-shell-nav") || target.closest("button")) return
            dragRef.current = {
              startX: e.clientX,
              startY: e.clientY,
              originX: rect.left,
              originY: rect.top,
            }
          }}
        >
          <div className="page-shell-title">
            <span className="page-shell-title-icon" style={{ display: "inline-flex", marginRight: 8 }}>
              <PageIcon path={path} size={18} plain />
            </span>
            {title}
          </div>

            <div className="page-shell-controls">
              <div className="page-shell-nav">
                <button aria-label="Back" className="ps-btn" onClick={() => navigate(-1)}>
                  <FiChevronLeft />
                </button>
                <button aria-label="Forward" className="ps-btn" onClick={() => navigate(1)}>
                  <FiChevronRight />
                </button>
                <button aria-label="Start" className="ps-btn" onClick={() => navigate('/') }>
                  <FiGrid />
                </button>
                <button
                  aria-label={isMaximized ? "Restore" : "Maximize"}
                  className="ps-btn"
                  onClick={() => {
                    setIsMaximized((prev) => {
                      if (prev) {
                        setRect(previousRect.current)
                        return false
                      }
                      previousRect.current = rect
                      setRect({
                        left: 12,
                        top: topBarHeight + 12,
                        width: window.innerWidth - 24,
                        height: window.innerHeight - topBarHeight - 24,
                      })
                      return true
                    })
                  }}
                >
                  {isMaximized ? <FiMinimize /> : <FiMaximize />}
                </button>
              </div>
            </div>
        </header>

        <motion.div
          className="page-shell-body"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.36, ease: "easeOut" }}
        >
          {children}
        </motion.div>
        <div
          className="page-shell-resizer"
          onMouseDown={(e) => {
            e.preventDefault()
            if (isMaximized) return
            resizeRef.current = {
              startX: e.clientX,
              startY: e.clientY,
              originW: rect.width,
              originH: rect.height,
            }
          }}
        />
      </div>
    </div>
  )
}

export default PageShell
