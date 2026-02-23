import { Link } from "react-router-dom"
import ProfileNav from "../../components/profile/ProfileNav"
import { useProfile } from "../../hooks/useProfile"

export default function ProfileIndex(){
  const { profile } = useProfile()

  return (
    <div className="profile-page">
      <header className="profile-header">
        <p className="profile-kicker">Account</p>
        <h1>Profile</h1>
        <p>Manage your profile, personal information, and account settings.</p>
      </header>

      <ProfileNav />

      <section className="profile-card">
        <h2 className="profile-card-title">Overview</h2>
        <div className="profile-overview-grid">
          <img className="profile-photo" src={profile.displayImage} alt={profile.name} />
          <div className="profile-detail-list">
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Display name:</strong> {profile.displayName}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Receive feedback emails:</strong> {profile.receiveFeedbackEmails ? "Yes" : "No"}</p>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/profile/edit" className="profile-action-link profile-btn-primary">
            Edit profile
          </Link>
        </div>
      </section>
    </div>
  )
}
