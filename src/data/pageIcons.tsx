import React from "react"
import { IconType } from "react-icons"
import { FiHome, FiInfo, FiFileText, FiFolder, FiBarChart2, FiEdit, FiCpu, FiMoreHorizontal, FiMail, FiUsers, FiHash } from "react-icons/fi"

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

export default function PageIcon({ path, size = 20 }: { path?: string; size?: number }) {
  if (!path) return null
  const key = path.toLowerCase()
  const Icon = map[key]
  if (!Icon) return null
  return <Icon size={size} />
}
