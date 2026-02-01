import { Link } from "react-router-dom"

export default function ProfileIndex(){
  return (
    <div style={{padding:24}}>
      <h1>Profile</h1>
      <p>Manage your profile.</p>
      <ul>
        <li><Link to="edit">Edit profile</Link></li>
        <li><Link to="settings">Settings</Link></li>
      </ul>
    </div>
  )
}
