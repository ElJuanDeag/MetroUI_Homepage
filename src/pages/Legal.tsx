export default function Legal() {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <p className="legal-kicker">Legal Notice</p>
        <h1>Site Operator</h1>
        <p>
          This website is operated by Brajesh Kumar as a personal portfolio and
          project hub.
        </p>
      </section>

      <section className="legal-grid">
        <article className="legal-card">
          <h2>Responsible Party</h2>
          <p>Brajesh Kumar</p>
          <p>Mumbai, India</p>
          <p>
            For privacy, legal, or website requests, use the contact page linked
            in the footer.
          </p>
        </article>

        <article className="legal-card">
          <h2>Editorial Responsibility</h2>
          <p>
            Content on this website is maintained by the site operator unless a
            page clearly links to an external service or third-party project.
          </p>
        </article>

        <article className="legal-card">
          <h2>External Links</h2>
          <p>
            External links are provided for convenience. The site operator is not
            responsible for content, availability, or privacy practices on
            third-party websites.
          </p>
        </article>

        <article className="legal-card">
          <h2>Intellectual Property</h2>
          <p>
            Unless stated otherwise, text, layout, and custom interface work on
            this website belong to the site operator. Third-party marks remain
            the property of their respective owners.
          </p>
        </article>
      </section>
    </div>
  )
}
