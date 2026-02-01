import { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineHome } from "react-icons/hi"

type Props = {
  children: ReactNode
  title?: string
}

const PageShell = ({ children, title }: Props) => {
  const navigate = useNavigate()

  return (
    <div className="page-shell">
      <header className="page-shell-header">
        <div className="page-shell-title">{title}</div>

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

      <div className="page-shell-body">{children}</div>
    </div>
  )
}

export default PageShell
