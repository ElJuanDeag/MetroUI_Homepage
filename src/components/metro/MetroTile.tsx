import { MetroTile as Tile, tileSpan } from "../../data/tiles"
import {
  HiOutlineInformationCircle,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineBeaker,
  HiOutlineNewspaper,
} from "react-icons/hi2"
import PageIcon from "../../data/pageIcons2"
import { motion } from "framer-motion"

type Props = {
  tile: Tile
  onOpen?: (tile: Tile, rect: DOMRect) => void
}

const iconMap: Record<string, JSX.Element> = {
  About: <HiOutlineInformationCircle />,
  Projects: <HiOutlineBriefcase />,
  Blog: <HiOutlineNewspaper />,
  Resume: <HiOutlineDocumentText />,
  Labs: <HiOutlineBeaker />,
}

const tileVariant = {
  hidden: { opacity: 0, y: 18, scale: 0.995 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
}

const MetroTile = ({ tile, onOpen }: Props) => {
  const { w, h } = tileSpan(tile.size)

  const handleClick = (e: React.MouseEvent) => {
    if (!onOpen) return
    const el = (e.currentTarget as HTMLDivElement).querySelector('.metro-tile-surface') as HTMLDivElement | null
    const rect = el ? el.getBoundingClientRect() : (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    onOpen(tile, rect)
  }

  return (
    <motion.div
      className="metro-tile"
      variants={tileVariant}
      style={{
        gridColumn: `span ${w}`,
        gridRow: `span ${h}`,
      }}
      aria-label={tile.title}
      role="group"
      tabIndex={0}
      onClick={handleClick}
    >
      <div
        className="metro-tile-surface"
        style={{
          backgroundColor: tile.color,
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Icon */}
        {iconMap[tile.title] ? (
          <div
            className="metro-tile-icon"
            style={{
              fontSize: "calc(var(--mu) * 0.55)",
              lineHeight: 1,
            }}
          >
            {iconMap[tile.title]}
          </div>
        ) : (
          <div
            className="metro-tile-icon"
            style={{
              fontSize: "calc(var(--mu) * 0.55)",
              lineHeight: 1,
            }}
          >
            <PageIcon path={`/${tile.id}`} size={Math.max(18, Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mu') || '120') * 0.55)) || 20} />
          </div>
        )}

        {/* Title (Metro-style overlay) */}
        <span className="metro-tile-title">{tile.title}</span>
      </div>
    </motion.div>
  )
}

export default MetroTile
