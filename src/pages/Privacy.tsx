export default function Privacy() {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <p className="legal-kicker">Privacy</p>
        <h1>Privacy Information</h1>
        <p>
          This page explains how this portfolio handles personal data for
          visitors in the European Union and elsewhere.
        </p>
      </section>

      <section className="legal-section">
        <h2>Data Controller</h2>
        <p>
          The data controller for this website is Brajesh Kumar. You can send
          privacy requests through the contact page linked in the footer.
        </p>
      </section>

      <section className="legal-section">
        <h2>Data Processed</h2>
        <ul>
          <li>Basic technical data such as IP address, browser type, device data, requested URL, date, and time may be processed by hosting and security providers.</li>
          <li>Local profile and notes features may store data in your browser storage on your own device.</li>
          <li>Weather tiles may contact IP location and weather providers to show local weather information.</li>
          <li>Project and repository pages may request public data from GitHub.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Purpose And Legal Basis</h2>
        <p>
          Data is processed to provide the website, maintain security, improve
          reliability, display requested features, and respond to user requests.
          The usual legal bases are legitimate interests, consent where required,
          and steps requested by the visitor.
        </p>
      </section>

      <section className="legal-section">
        <h2>Third-Party Services</h2>
        <p>
          This site may use infrastructure, analytics, public API, IP lookup, and
          weather services. These providers may process technical data under
          their own privacy terms when their services are requested by the site.
        </p>
      </section>

      <section className="legal-section">
        <h2>Your Rights</h2>
        <p>
          If EU or UK data protection law applies, you may have rights to access,
          correct, delete, restrict, object to processing, portability, and lodge
          a complaint with a supervisory authority.
        </p>
      </section>

      <section className="legal-section">
        <h2>Retention</h2>
        <p>
          Browser storage remains on your device until you clear it. Server logs
          and provider logs are retained only as long as needed for security,
          diagnostics, and service operation.
        </p>
      </section>
    </div>
  )
}
