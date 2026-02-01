import { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineHome } from "react-icons/hi"
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
  const hexToRgba = (hex: string, alpha = 1) => {
    const h = hex.replace('#', '')
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
    const bigint = parseInt(full, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return (
    <div
      className="page-shell"
      style={{
        ['--page-color' as any]: colorHex,
        backgroundColor: hexToRgba(colorHex, 0.6),
        backgroundImage: 'none',
        minHeight: '100vh',
        color: '#fff',
      }}
    >
      <header className="page-shell-header" style={{ backgroundColor: hexToRgba(colorHex, 1), color: '#fff' }}>
        <div className="page-shell-title">
          <span className="page-shell-title-icon" style={{ display: "inline-flex", marginRight: 8 }}>
            <PageIcon path={path} size={18} plain />
          </span>
          {title}
        </div>

        <div className="page-shell-controls">
          <div className="page-shell-actions">
            {/* stub for future page actions */}
          </div>

          <div className="page-shell-nav">
            <button aria-label="Back" className="ps-btn" onClick={() => navigate(-1)}>
              <HiOutlineArrowLeft />
            </button>
            <button aria-label="Forward" className="ps-btn" onClick={() => navigate(1)}>
              <HiOutlineArrowRight />
            </button>
            <button aria-label="Home" className="ps-btn" onClick={() => navigate('/') }>
              <HiOutlineHome />
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
    </div>
  )
}

export default PageShell
