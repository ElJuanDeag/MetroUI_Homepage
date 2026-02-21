import { useNavigate } from "react-router-dom"
import { HiOutlineUser } from "react-icons/hi2"

const TopBar = () => {
  const nav = useNavigate()

  return (
    <div className="top-bar">
      <span className="top-bar-title">BRAJE.sh</span>

      <div
        className="profile-button"
        role="button"
        aria-label="Profile"
        onClick={() => nav('/profile')}
      >
        <HiOutlineUser size={20} />
      </div>
    </div>
  )
}

export default TopBar
