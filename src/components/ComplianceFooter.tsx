import { Link } from "react-router-dom"

const links = [
  { label: "Legal Notice", to: "/legal" },
  { label: "Privacy", to: "/privacy" },
  { label: "Cookies", to: "/cookies" },
  { label: "Terms", to: "/terms" },
  { label: "Accessibility", to: "/accessibility" },
  { label: "Contact", to: "/contact" },
]

export default function ComplianceFooter() {
  return (
    <footer className="compliance-footer" aria-label="Legal and compliance links">
      <div className="compliance-footer-copy">
        <span>© {new Date().getFullYear()} Brajesh Kumar</span>
        <span>EU privacy and transparency information</span>
      </div>
      <nav className="compliance-footer-links" aria-label="Compliance">
        {links.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  )
}

export { links as complianceLinks }
