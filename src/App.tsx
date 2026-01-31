import { BrowserRouter, Routes, Route } from "react-router-dom"
import TopBar from "./components/TopBar"
import MetroGrid from "./components/metro/MetroGrid"
import PageShell from "./components/PageShell"
import ProfileIndex from "./pages/profile/index"
import ProfileEdit from "./pages/profile/edit"
import ProfileSettings from "./pages/profile/settings"

const GenericPage = ({ title }: { title: string }) => (
  <PageShell>
    <div style={{ padding: 24 }}>
      <h1>{title}</h1>
      <p>This is a placeholder page for {title}.</p>
    </div>
  </PageShell>
)

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-root">
        <TopBar />

        <Routes>
          <Route path="/" element={<MetroGrid />} />
          <Route path="/profile/*" element={<ProfileLayout />} />
          <Route path="/:slug" element={<PageRoute />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

function PageRoute() {
  // lazy generic page rendering based on slug
  const { slug } = (window as any).location.pathname
  // fallback: show slug from location
  const title = decodeURIComponent(window.location.pathname.replace(/^\//, "")).replace(/-/g, " ") || "Page"
  return <GenericPage title={title.replace(/\b\w/g, (c) => c.toUpperCase())} />
}

function ProfileLayout(){
  return (
    <Routes>
      <Route path="/" element={<ProfileIndex/>} />
      <Route path="edit" element={<ProfileEdit/>} />
      <Route path="settings" element={<ProfileSettings/>} />
    </Routes>
  )
}

export default App
