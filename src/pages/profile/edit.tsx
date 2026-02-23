import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import ProfileNav from "../../components/profile/ProfileNav"
import type { ProfileData } from "../../hooks/useProfile"
import { useProfile } from "../../hooks/useProfile"

export default function ProfileEdit(){
  const { profile, setProfile } = useProfile()
  const [draft, setDraft] = useState<ProfileData>(profile)

  useEffect(() => {
    setDraft(profile)
  }, [profile])

  const onImageUpload = async (file: File | undefined) => {
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    setDraft((prev) => ({ ...prev, displayImage: dataUrl }))
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <p className="profile-kicker">Account</p>
        <h1>Edit Profile</h1>
        <p>Update public information, bio, and links shown across your profile.</p>
      </header>

      <ProfileNav />

      <section className="profile-card">
        <Field label="Name">
          <input
            className="profile-input"
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
          />
        </Field>

        <Field label="Upload image">
          <input
            className="profile-file-input"
            type="file"
            accept="image/*"
            onChange={(e) => void onImageUpload(e.target.files?.[0])}
          />
        </Field>

        <img className="profile-photo profile-photo-preview" src={draft.displayImage} alt={draft.name} />

        <Field label="Display name">
          <input
            className="profile-input"
            value={draft.displayName}
            onChange={(e) => setDraft((prev) => ({ ...prev, displayName: e.target.value }))}
          />
        </Field>

        <Field label="Email">
          <input
            className="profile-input"
            type="email"
            value={draft.email}
            onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
          />
        </Field>

        <label className="profile-check-item">
          <input
            type="checkbox"
            checked={draft.receiveFeedbackEmails}
            onChange={(e) => setDraft((prev) => ({ ...prev, receiveFeedbackEmails: e.target.checked }))}
          />
          Receive feedback emails
        </label>
      </section>

      <section className="profile-actions">
        <button
          type="button"
          className="profile-btn profile-btn-primary"
          onClick={() => setProfile(draft)}
        >
          Save changes
        </button>
        <button
          type="button"
          className="profile-btn"
          onClick={() => setDraft(profile)}
        >
          Discard
        </button>
        <Link to="/profile" className="profile-action-link">Back to profile</Link>
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="profile-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("Could not read uploaded image"))
    reader.readAsDataURL(file)
  })
