import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { HiOutlineUser } from "react-icons/hi2"
import { useProfile } from "../hooks/useProfile"

const TopBar = () => {
  const nav = useNavigate()
  const { profile } = useProfile()
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    setImgFailed(false)
  }, [profile.displayImage])

  const hasImage = Boolean(profile.displayImage) && !imgFailed

  return (
    <div className="top-bar">
      <span className="top-bar-title">BRAJE.sh</span>

      <div
        className="profile-button"
        role="button"
        aria-label="Profile"
        onClick={() => nav('/profile')}
      >
        {hasImage ? (
          <img
            src={profile.displayImage}
            alt={profile.name}
            className="profile-button-image"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <HiOutlineUser size={20} />
        )}
      </div>
    </div>
  )
}

export default TopBar
