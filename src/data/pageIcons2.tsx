import { IconType } from "react-icons"
import {
  FiHome,
  FiInfo,
  FiFileText,
  FiFolder,
  FiBarChart2,
  FiEdit,
  FiCpu,
  FiMoreHorizontal,
  FiMail,
  FiUsers,
  FiGithub,
  FiServer,
  FiBox,
  FiGrid,
  FiMusic,
  FiClock,
  FiCloud,
  FiSun,
  FiMonitor,
} from "react-icons/fi"
import { tileRows } from "./tiles"

const map: Record<string, IconType> = {
  "/": FiHome,
  "/about": FiInfo,
  "/projects": FiFolder,
  "/stats": FiBarChart2,
  "/notes": FiFileText,
  "/blog": FiEdit,
  "/resume": FiFileText,
  "/labs": FiCpu,
  "/misc": FiMoreHorizontal,
  "/more": FiMoreHorizontal,
  "/alpha": FiClock,
  "/beta": FiCloud,
  "/gamma": FiSun,
  "/delta": FiMonitor,
  "/one": FiGithub,
  "/two": FiServer,
  "/three": FiBox,
  "/four": FiGrid,
  "/five": FiMusic,
  "/contact": FiMail,
  "/profile": FiUsers,
  "/profile/edit": FiEdit,
  "/profile/settings": FiCpu,
}

const defaultColor = "#0078D7"

function normalizePath(path?: string) {
  if (!path) return "/"
  const trimmed = path.trim()
  if (!trimmed) return "/"
  return trimmed.startsWith("/") ? trimmed.toLowerCase() : `/${trimmed.toLowerCase()}`
}

function findTileColor(path?: string) {
  const key = normalizePath(path)
  for (const row of tileRows) {
    for (const group of row.groups) {
      for (const t of group.tiles) {
        if (normalizePath(t.slug) === key) return t.color
      }
    }
  }
  if (key.startsWith("/profile")) return "#444444"
  return defaultColor
}

export function getColorForPath(path?: string) {
  return findTileColor(path)
}

export default function PageIcon({ path, size = 20, plain = false }: { path?: string; size?: number; plain?: boolean }) {
  if (!path) return null
  const key = path.toLowerCase()
  const Icon = map[key]
  if (!Icon) return null
  const color = findTileColor(path)
  if (plain) return <Icon size={size} color="#fff" />
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size + 12,
      height: size + 12,
      borderRadius: 8,
      backgroundColor: color,
      color: '#fff'
    }}>
      <Icon size={size} />
    </span>
  )
}
