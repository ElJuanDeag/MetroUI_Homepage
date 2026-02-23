import { useSyncExternalStore } from "react"

export type ProfileData = {
  name: string
  displayImage: string
  displayName: string
  email: string
  receiveFeedbackEmails: boolean
}

const STORAGE_KEY = "metro.profile.v1"

const defaultProfile: ProfileData = {
  name: "Mukesh Braje",
  displayImage: "/assets/Profile_Brajesh.jpg",
  displayName: "mukesh",
  email: "mukesh@example.com",
  receiveFeedbackEmails: true,
}

const parseProfile = (value: string | null): ProfileData => {
  if (!value) return defaultProfile
  try {
    const parsed = JSON.parse(value) as Partial<ProfileData>
    return {
      name: parsed.name || defaultProfile.name,
      displayImage: parsed.displayImage || defaultProfile.displayImage,
      displayName: parsed.displayName || defaultProfile.displayName,
      email: parsed.email || defaultProfile.email,
      receiveFeedbackEmails:
        typeof parsed.receiveFeedbackEmails === "boolean"
          ? parsed.receiveFeedbackEmails
          : defaultProfile.receiveFeedbackEmails,
    }
  } catch {
    return defaultProfile
  }
}

const readStoredProfile = (): ProfileData => {
  if (typeof window === "undefined") return defaultProfile
  return parseProfile(window.localStorage.getItem(STORAGE_KEY))
}

let currentProfile: ProfileData = readStoredProfile()
const listeners = new Set<() => void>()

const emitChange = () => {
  listeners.forEach((listener) => listener())
}

const writeProfile = (next: ProfileData) => {
  currentProfile = next
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    // TODO: Replace localStorage write with authenticated SSO profile API sync.
  }
  emitChange()
}

export const useProfile = () => {
  const profile = useSyncExternalStore(
    (listener) => {
      listeners.add(listener)

      const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return
        currentProfile = parseProfile(event.newValue)
        emitChange()
      }

      window.addEventListener("storage", onStorage)
      return () => {
        listeners.delete(listener)
        window.removeEventListener("storage", onStorage)
      }
    },
    () => currentProfile,
    () => defaultProfile
  )

  const setProfile = (next: ProfileData) => {
    writeProfile(next)
  }

  const updateProfile = (patch: Partial<ProfileData>) => {
    writeProfile({ ...currentProfile, ...patch })
  }

  return {
    profile,
    setProfile,
    updateProfile,
  }
}
