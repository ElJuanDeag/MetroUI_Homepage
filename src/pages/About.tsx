import { useEffect, useState } from "react"
import { optionalJson } from "../lib/api"

type ProfileContent = {
  name: string
  location: string
  affiliation: string
  summary: string[]
  strengths: string[]
  focus: string[]
  stack: string[]
  links: Array<{ label: string; url: string }>
}

const fallbackProfile: ProfileContent = {
  name: "Brajesh Kumar",
  location: "Mumbai",
  affiliation: "Nomura",
  summary: [
    "Builder focused on practical software, clean interfaces, and personal projects that ship. I enjoy turning ideas into usable, reliable products with strong attention to detail.",
    "Based in Mumbai and currently at Nomura, with ongoing hands-on development work shared through my public portfolio and repositories.",
  ],
  strengths: [
    "Execution-first approach with a bias toward shipping.",
    "Strong ownership from idea to deploy.",
    "Clean UI decisions with a practical engineering mindset.",
  ],
  focus: [
    "Metro-inspired web experiences with React and TypeScript.",
    "Cloudflare-based analytics and platform integrations.",
    "Simple systems that are maintainable and fast to iterate.",
  ],
  stack: ["React", "TypeScript", "Vite", "Cloudflare", "UI Engineering", "API Integrations", "Analytics", "Rapid Prototyping"],
  links: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/brajesh-kumar-6103401b4/" },
    { label: "GitHub", url: "https://github.com/ElJuanDeag" },
    { label: "Website", url: "https://braje.sh" },
  ],
}

export default function About() {
  const [profile, setProfile] = useState<ProfileContent>(fallbackProfile)

  useEffect(() => {
    const controller = new AbortController()
    optionalJson<ProfileContent>("/api/content/profile", {}, controller.signal).then((payload) => {
      if (payload) setProfile(payload)
    })
    return () => controller.abort()
  }, [])

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-photo-wrap">
          <img
            className="about-photo"
            src="/assets/Profile_Brajesh.jpg"
            alt="Brajesh Kumar"
          />
        </div>

        <div className="about-intro">
          <p className="about-kicker">About</p>
          <h1>{profile.name}</h1>
          {profile.summary.map((item) => (
            <p className="about-summary" key={item}>
              {item}
            </p>
          ))}

          <div className="about-links">
            {profile.links.map((link) => (
              <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="about-grid">
        <article className="about-card">
          <h2>Strengths</h2>
          <ul>
            {profile.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="about-card">
          <h2>Current Focus</h2>
          <ul>
            {profile.focus.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="about-highlights">
        <h2>Highlights</h2>
        <div className="about-highlight-grid">
          <article className="about-highlight-card">
            <p className="about-highlight-number">9+</p>
            <p className="about-highlight-label">Public Repositories</p>
          </article>
          <article className="about-highlight-card">
            <p className="about-highlight-number">2019</p>
            <p className="about-highlight-label">Active on GitHub Since</p>
          </article>
          <article className="about-highlight-card">
            <p className="about-highlight-number">{profile.location}</p>
            <p className="about-highlight-label">Current Base</p>
          </article>
          <article className="about-highlight-card">
            <p className="about-highlight-number">{profile.affiliation}</p>
            <p className="about-highlight-label">Professional Affiliation</p>
          </article>
        </div>
      </section>

      <section className="about-stack">
        <h2>Preferred Stack</h2>
        <div className="about-chip-row">
          {profile.stack.map((item) => (
            <span className="about-chip" key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="about-quote">
        <blockquote>
          "Build fast, keep it clean, and make it usable from day one."
        </blockquote>
      </section>
    </div>
  )
}
