import React from "react"
import { IconType } from "react-icons"
import { FiHome, FiInfo, FiFileText, FiFolder, FiBarChart2, FiEdit, FiCpu, FiMoreHorizontal, FiMail, FiUsers, FiHash } from "react-icons/fi"
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
  "/alpha": FiHash,
  "/beta": FiHash,
  "/gamma": FiHash,
  "/delta": FiHash,
  "/one": FiHash,
  "/two": FiHash,
  "/three": FiHash,
  "/four": FiHash,
  "/five": FiHash,
  "/contact": FiMail,
  "/profile": FiUsers,
  "/profile/edit": FiEdit,
  "/profile/settings": FiCpu,
}

const defaultColor = "#0078D7"

function findTileColor(path?: string) {
  if (!path) return defaultColor
  const key = path.replace(/^\//, "").toLowerCase()
  for (const row of tileRows) {
    for (const group of row.groups) {
      for (const t of group.tiles) {
        if (t.id.toLowerCase() === key) return t.color
      }
    }
  }
  if (key.startsWith("profile")) return "#444444"
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
