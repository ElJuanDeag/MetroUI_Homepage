export default function Accessibility() {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <p className="legal-kicker">Accessibility</p>
        <h1>Accessibility Statement</h1>
        <p>
          This website aims to provide a usable experience across keyboard,
          pointer, desktop, and mobile browsing contexts.
        </p>
      </section>

      <section className="legal-section">
        <h2>Current Measures</h2>
        <ul>
          <li>Interactive controls use labels where icon-only buttons appear.</li>
          <li>Pages and windows keep visible focus states for keyboard navigation.</li>
          <li>Content is structured with headings, sections, and descriptive link text.</li>
          <li>Layouts include responsive rules for small screens.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Known Constraints</h2>
        <p>
          The Metro-style draggable window interface is visual and interactive by
          design. Some advanced window behavior may be less convenient for screen
          reader or keyboard-only users than a conventional document layout.
        </p>
      </section>

      <section className="legal-section">
        <h2>Feedback</h2>
        <p>
          If you find an accessibility problem, use the contact page linked in
          the footer and include the page URL, browser, device, and a short
          description of the issue.
        </p>
      </section>
    </div>
  )
}
