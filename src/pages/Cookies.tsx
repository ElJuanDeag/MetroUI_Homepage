export default function Cookies() {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <p className="legal-kicker">Cookies</p>
        <h1>Cookies And Local Storage</h1>
        <p>
          This site is designed to avoid non-essential tracking cookies by
          default.
        </p>
      </section>

      <section className="legal-grid">
        <article className="legal-card">
          <h2>Essential Storage</h2>
          <p>
            The browser may store settings, profile details, or notes locally so
            interactive features continue to work between visits.
          </p>
        </article>

        <article className="legal-card">
          <h2>Analytics And Security</h2>
          <p>
            Hosting, security, or analytics infrastructure may process technical
            request data to keep the website available and safe.
          </p>
        </article>

        <article className="legal-card">
          <h2>Third-Party Requests</h2>
          <p>
            Weather, repository, and external service links can contact
            third-party providers when those features are loaded or clicked.
          </p>
        </article>

        <article className="legal-card">
          <h2>Your Controls</h2>
          <p>
            You can clear cookies and local storage in your browser settings.
            Disabling storage may reduce functionality for profile and notes
            features.
          </p>
        </article>
      </section>
    </div>
  )
}
