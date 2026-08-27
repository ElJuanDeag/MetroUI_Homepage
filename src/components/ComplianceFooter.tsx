import { Link } from "react-router-dom"
import { FiGithub, FiLinkedin } from "react-icons/fi"

const links = [
  { label: "Privacy", to: "/privacy" },
  { label: "Contact", to: "/contact" },
]

const socialLinks = [
  { label: "GitHub", href: "https://github.com/ElJuanDeag", icon: FiGithub },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/brajesh-kumar-6103401b4/", icon: FiLinkedin },
]

export default function ComplianceFooter() {
  return (
    <footer className="compliance-footer" aria-label="Footer links">
      <div className="compliance-footer-copy">
        <span>© {new Date().getFullYear()} Brajesh Kumar</span>
        <span>Personal portfolio and project archive.</span>
      </div>
      <nav className="compliance-footer-links" aria-label="Footer">
        {links.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
        {socialLinks.map(({ label, href, icon: Icon }) => (
          <a key={href} href={href} target="_blank" rel="noreferrer" aria-label={label}>
            <Icon size={16} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </footer>
  )
}

export { links as complianceLinks }
