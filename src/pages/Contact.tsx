import { FormEvent, useState } from "react"
import { requestJson } from "../lib/api"

type ContactResponse = {
  ok: boolean
  message?: string
}

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      subject: String(data.get("subject") || "").trim(),
      message: String(data.get("message") || "").trim(),
      website: String(data.get("website") || "").trim(),
    }

    if (!payload.name || !payload.email || !payload.message) {
      setStatus("error")
      setError("Name, email, and message are required.")
      return
    }

    try {
      setStatus("sending")
      setError(null)
      const response = await requestJson<ContactResponse>("/api/contact", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error(response.message || "Message was not accepted.")
      setStatus("sent")
      form.reset()
    } catch (err) {
      setStatus("error")
      setError((err as Error).message || "Could not send the message right now.")
    }
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <p className="contact-kicker">Contact</p>
        <h1>Send A Message</h1>
        <p>
          This form posts to the server so messages can be delivered, logged,
          rate-limited, and filtered without exposing an email address.
        </p>
      </section>

      <form className="contact-form" onSubmit={submitContact}>
        <label>
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>Subject</span>
          <input name="subject" type="text" autoComplete="off" />
        </label>
        <label className="contact-honey">
          <span>Website</span>
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
        <label>
          <span>Message</span>
          <textarea name="message" rows={7} required />
        </label>

        <div className="contact-actions">
          <button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
          {status === "sent" && <p className="contact-status">Message sent.</p>}
          {status === "error" && <p className="contact-status is-error">{error}</p>}
        </div>
      </form>
    </div>
  )
}
