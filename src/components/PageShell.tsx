import { ReactNode } from "react"

type Props = {
  children: ReactNode
}

const PageShell = ({ children }: Props) => {
  return <div className="page-shell">{children}</div>
}

export default PageShell
