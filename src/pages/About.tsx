export default function About() {
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
          <h1>Brajesh Kumar</h1>
          <p className="about-summary">
            Builder focused on practical software, clean interfaces, and
            personal projects that ship. I enjoy turning ideas into usable,
            reliable products with strong attention to detail.
          </p>
          <p className="about-summary">
            Based in Mumbai and currently at Nomura, with ongoing hands-on
            development work shared through my public portfolio and repositories.
          </p>

          <div className="about-links">
            <a href="https://www.linkedin.com/in/brajesh-kumar-6103401b4/" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="https://github.com/ElJuanDeag" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://braje.sh" target="_blank" rel="noreferrer">
              Website
            </a>
          </div>
        </div>
      </section>

      <section className="about-grid">
        <article className="about-card">
          <h2>Strengths</h2>
          <ul>
            <li>Execution-first approach with a bias toward shipping.</li>
            <li>Strong ownership from idea to deploy.</li>
            <li>Clean UI decisions with a practical engineering mindset.</li>
          </ul>
        </article>

        <article className="about-card">
          <h2>Current Focus</h2>
          <ul>
            <li>Metro-inspired web experiences with React and TypeScript.</li>
            <li>Cloudflare-based analytics and platform integrations.</li>
            <li>Simple systems that are maintainable and fast to iterate.</li>
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
            <p className="about-highlight-number">Mumbai</p>
            <p className="about-highlight-label">Current Base</p>
          </article>
          <article className="about-highlight-card">
            <p className="about-highlight-number">Nomura</p>
            <p className="about-highlight-label">Professional Affiliation</p>
          </article>
        </div>
      </section>

      <section className="about-stack">
        <h2>Preferred Stack</h2>
        <div className="about-chip-row">
          <span className="about-chip">React</span>
          <span className="about-chip">TypeScript</span>
          <span className="about-chip">Vite</span>
          <span className="about-chip">Cloudflare</span>
          <span className="about-chip">UI Engineering</span>
          <span className="about-chip">API Integrations</span>
          <span className="about-chip">Analytics</span>
          <span className="about-chip">Rapid Prototyping</span>
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
