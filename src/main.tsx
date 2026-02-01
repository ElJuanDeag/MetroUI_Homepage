import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

import "./styles/reset.css"
import "./styles/global.css"
import "./styles/layout.css"
import "./styles/theme.css"
import "./styles/metro.css"
import "./styles/page-shell.css"

// 🔒 GUARANTEED MU INITIALIZATION
const initMU = () => {
  const updateMU = () => {
    const vh = window.innerHeight
    const mu = Math.max(vh / 5, 120)
    document.documentElement.style.setProperty("--mu", `${mu}px`)
  }

  updateMU()
  window.addEventListener("resize", updateMU)
}

initMU()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
