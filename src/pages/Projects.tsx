import { useEffect, useMemo, useState } from "react"

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

const GITHUB_USER = "ElJuanDeag"
const REPOS_API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?type=public&per_page=100&sort=updated`

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(new Date(value))

export default function Projects() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadRepos = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(REPOS_API_URL, {
          method: "GET",
          headers: { Accept: "application/vnd.github+json" },
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`GitHub request failed (${response.status})`)
        }

        const payload = (await response.json()) as Repo[]
        setRepos(payload)
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
    () => [...repos].sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    [repos]
  )

  return (
    <div className="projects-page">
      <header className="projects-header">
        <p className="projects-kicker">GitHub Portfolio</p>
        <h1>Projects</h1>
        <p>Public repositories from @{GITHUB_USER}. Forked repositories are labeled.</p>
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
                <a href={repo.html_url} target="_blank" rel="noreferrer" className="projects-repo-link">
                  {repo.name}
                </a>
                {repo.fork && <span className="projects-fork-tag">Fork</span>}
              </div>

              <p className="projects-description">{repo.description || "No description provided."}</p>

              <div className="projects-meta">
                <span>{repo.language || "Unknown"}</span>
                <span>Stars: {repo.stargazers_count}</span>
                <span>Updated: {formatDate(repo.updated_at)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
