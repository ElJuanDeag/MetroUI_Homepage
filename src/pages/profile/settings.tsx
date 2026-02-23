import { Link } from "react-router-dom"
import ProfileNav from "../../components/profile/ProfileNav"

export default function ProfileSettings(){
  return (
    <div className="profile-page">
      <header className="profile-header">
        <p className="profile-kicker">Account</p>
        <h1>Profile Settings</h1>
        <p>Control visibility, notifications, and security preferences for your account.</p>
      </header>

      <ProfileNav />

      <section className="profile-card">
        <h2 className="profile-card-title">Privacy</h2>
        <SettingRow title="Public profile" desc="Allow visitors to view your profile and portfolio." enabled />
        <SettingRow title="Show online status" desc="Display your active status to collaborators." enabled={false} />
        <SettingRow title="Show activity feed" desc="Share your latest actions on your profile page." enabled />
      </section>

      <section className="profile-card">
        <h2 className="profile-card-title">Notifications</h2>
        <SettingRow title="Product updates" desc="Receive release notes and feature announcements." enabled />
        <SettingRow title="Mentions" desc="Get alerted when someone tags you in notes or comments." enabled />
        <SettingRow title="Weekly summary" desc="Receive a weekly digest of activity and metrics." enabled={false} />
      </section>

      <section className="profile-card">
        <h2 className="profile-card-title">Security</h2>
        <SettingRow title="Two-factor authentication" desc="Require a code during sign in." enabled />
        <SettingRow title="Login alerts" desc="Email alert when a new device logs into your account." enabled />
        <SettingRow title="Session timeout" desc="Auto sign-out after 30 minutes of inactivity." enabled={false} />
      </section>

      <section className="profile-actions">
        <button type="button" className="profile-btn profile-btn-primary">Save settings</button>
        <button type="button" className="profile-btn">Reset defaults</button>
        <Link to="/profile" className="profile-action-link">Back to profile</Link>
      </section>
    </div>
  )
}

function SettingRow({ title, desc, enabled }: { title: string; desc: string; enabled: boolean }) {
  return (
    <label className="profile-row">
      <span className="profile-row-copy">
        <span>{title}</span>
        <span>{desc}</span>
      </span>
      <input type="checkbox" defaultChecked={enabled} />
    </label>
  )
}
