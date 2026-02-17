import { ReactNode, useEffect, useRef, useState } from "react"
import { FiMaximize, FiMinimize, FiX } from "react-icons/fi"

type Rect = { left: number; top: number; width: number; height: number }

type Props = {
  id: string
  title: string
  rect: Rect
  z: number
  onRectChange: (id: string, rect: Rect) => void
  onFocus: (id: string) => void
  onClose: (id: string) => void
  children: ReactNode
}

const MetroWindow = ({ id, title, rect, z, onRectChange, onFocus, onClose, children }: Props) => {
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number; pointerId: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; originW: number; originH: number; pointerId: number } | null>(null)
  const [isMaximized, setIsMaximized] = useState(false)
  const previousRect = useRef(rect)
  const topBarHeight = 56

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragRef.current && !isMaximized && e.pointerId === dragRef.current.pointerId) {
        const { startX, startY, originX, originY } = dragRef.current
        const nextLeft = originX + (e.clientX - startX)
        const nextTop = originY + (e.clientY - startY)
        const maxLeft = window.innerWidth - rect.width - 12
        const maxTop = window.innerHeight - rect.height - 12
        onRectChange(id, {
          ...rect,
          left: Math.max(12, Math.min(maxLeft, nextLeft)),
          top: Math.max(topBarHeight + 12, Math.min(maxTop, nextTop)),
        })
      }
      if (resizeRef.current && !isMaximized && e.pointerId === resizeRef.current.pointerId) {
        const { startX, startY, originW, originH } = resizeRef.current
        const minW = Math.min(520, Math.max(280, Math.floor(window.innerWidth * 0.6)))
        const minH = Math.min(320, Math.max(200, Math.floor(window.innerHeight * 0.45)))
        const maxW = window.innerWidth - rect.left - 12
        const maxH = window.innerHeight - rect.top - 12
        const nextW = Math.min(maxW, Math.max(minW, originW + (e.clientX - startX)))
        const nextH = Math.min(maxH, Math.max(minH, originH + (e.clientY - startY)))
        onRectChange(id, { ...rect, width: nextW, height: nextH })
      }
    }
    const onUp = (e: PointerEvent) => {
      if (dragRef.current && e.pointerId === dragRef.current.pointerId) dragRef.current = null
      if (resizeRef.current && e.pointerId === resizeRef.current.pointerId) resizeRef.current = null
    }
    const onCancel = (e: PointerEvent) => {
      if (dragRef.current && e.pointerId === dragRef.current.pointerId) dragRef.current = null
      if (resizeRef.current && e.pointerId === resizeRef.current.pointerId) resizeRef.current = null
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onCancel)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
    }
  }, [id, isMaximized, onRectChange, rect, topBarHeight])

  const toggleMaximize = () => {
    setIsMaximized((prev) => {
      if (prev) {
        onRectChange(id, previousRect.current)
        return false
      }
      previousRect.current = rect
      onRectChange(id, {
        left: 12,
        top: topBarHeight + 12,
        width: window.innerWidth - 24,
        height: window.innerHeight - topBarHeight - 24,
      })
      return true
    })
  }

  return (
    <div
      className="metro-window"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        zIndex: z,
      }}
      onPointerDown={() => onFocus(id)}
    >
      <header
        className="metro-window-header"
        onPointerDown={(e) => {
          const target = e.target as HTMLElement
          if (target.closest(".metro-window-controls") || target.closest("button")) return
          dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            originX: rect.left,
            originY: rect.top,
            pointerId: e.pointerId,
          }
        }}
      >
        <div className="metro-window-title">{title}</div>
        <div className="metro-window-controls">
          <button className="metro-window-btn" aria-label={isMaximized ? "Restore" : "Maximize"} onClick={toggleMaximize}>
            {isMaximized ? <FiMinimize /> : <FiMaximize />}
          </button>
          <button className="metro-window-btn is-close" aria-label="Close" onClick={() => onClose(id)}>
            <FiX />
          </button>
        </div>
      </header>
      <div className="metro-window-body">{children}</div>
      <div
        className="metro-window-resizer"
        onPointerDown={(e) => {
          e.preventDefault()
          if (isMaximized) return
          resizeRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            originW: rect.width,
            originH: rect.height,
            pointerId: e.pointerId,
          }
        }}
      />
    </div>
  )
}

export default MetroWindow
