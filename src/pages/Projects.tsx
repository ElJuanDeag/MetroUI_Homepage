import { useEffect, useMemo, useState } from "react"
import { optionalJson } from "../lib/api"

type Repo = {
  id: number
  name: string
  html_url: string
  description: string | null
  fork: boolean
  language: string | null
  stargazers_count: number
  updated_at: string
}

type ProjectContent = {
  id: string | number
  name: string
  url: string
  description?: string
  fork?: boolean
  language?: string
  stars?: number
  updatedAt?: string
}

const GITHUB_USER = "ElJuanDeag"
const REPOS_API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?type=public&per_page=100&sort=updated`

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(new Date(value))

export default function Projects() {
  const [projects, setProjects] = useState<ProjectContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<"server" | "github">("github")

  useEffect(() => {
    const controller = new AbortController()

    const loadRepos = async () => {
      try {
        setLoading(true)
        setError(null)

        const managedProjects = await optionalJson<ProjectContent[]>("/api/content/projects", {}, controller.signal)

        if (managedProjects && Array.isArray(managedProjects)) {
          setProjects(managedProjects)
          setSource("server")
        } else {
          const response = await fetch(REPOS_API_URL, {
            method: "GET",
            headers: { Accept: "application/vnd.github+json" },
            signal: controller.signal
          })

          if (!response.ok) {
            throw new Error(`GitHub request failed (${response.status})`)
          }

          const payload = (await response.json()) as Repo[]
          setProjects(payload.map((repo) => ({
            id: repo.id,
            name: repo.name,
            url: repo.html_url,
            description: repo.description || undefined,
            fork: repo.fork,
            language: repo.language || undefined,
            stars: repo.stargazers_count,
            updatedAt: repo.updated_at,
          })))
          setSource("github")
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        setError("Could not load repositories from GitHub.")
      } finally {
        setLoading(false)
      }
    }

    loadRepos()
    return () => controller.abort()
  }, [])

  const sortedRepos = useMemo(
    () => [...projects].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")),
    [projects]
  )

  return (
    <div className="projects-page">
      <header className="projects-header">
        <p className="projects-kicker">GitHub Portfolio</p>
        <h1>Projects</h1>
        <p>{source === "server" ? "Managed project data from the server." : `Public repositories from @${GITHUB_USER}. Forked repositories are labeled.`}</p>
      </header>

      <p className="projects-profile-link-wrap">
        <a className="projects-profile-link" href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer">
          View full profile
        </a>
      </p>

      {loading && <p className="projects-status">Loading repositories...</p>}
      {error && <p className="projects-status projects-status-error">{error}</p>}

      {!loading && !error && (
        <div className="projects-grid">
          {sortedRepos.map((repo) => (
            <article key={repo.id} className="projects-card">
              <div className="projects-card-top">
                <a href={repo.url} target="_blank" rel="noreferrer" className="projects-repo-link">
                  {repo.name}
                </a>
                {repo.fork && <span className="projects-fork-tag">Fork</span>}
              </div>

              <p className="projects-description">{repo.description || "No description provided."}</p>

              <div className="projects-meta">
                <span>{repo.language || "Unknown"}</span>
                <span>Stars: {repo.stars ?? 0}</span>
                <span>Updated: {repo.updatedAt ? formatDate(repo.updatedAt) : "Not listed"}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
