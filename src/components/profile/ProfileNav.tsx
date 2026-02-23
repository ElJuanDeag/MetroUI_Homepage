import { NavLink } from "react-router-dom"

const ProfileNav = () => {
  return (
    <nav className="profile-nav" aria-label="Profile pages">
      <NavLink to="/profile" end className={({ isActive }) => `profile-nav-link${isActive ? " is-active" : ""}`}>
        Overview
      </NavLink>
      <NavLink to="/profile/edit" className={({ isActive }) => `profile-nav-link${isActive ? " is-active" : ""}`}>
        Edit
      </NavLink>
      <NavLink to="/profile/settings" className={({ isActive }) => `profile-nav-link${isActive ? " is-active" : ""}`}>
        Settings
      </NavLink>
    </nav>
  )
}

export default ProfileNav
