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
  iconSize: number
  onOpen?: (tile: Tile) => void
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

const MetroTile = ({ tile, iconSize, onOpen }: Props) => {
  const { w, h } = tileSpan(tile.size)

  const handleClick = () => {
    if (!onOpen) return
    onOpen(tile)
  }

  return (
    <motion.button
      className="metro-tile"
      variants={tileVariant}
      style={{
        gridColumn: `span ${w}`,
        gridRow: `span ${h}`,
      }}
      type="button"
      aria-label={tile.title}
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
              fontSize: iconSize,
              lineHeight: 1,
            }}
          >
            {iconMap[tile.title]}
          </div>
        ) : (
          <div
            className="metro-tile-icon"
            style={{
              fontSize: iconSize,
              lineHeight: 1,
            }}
          >
            <PageIcon path={tile.slug} size={iconSize} />
          </div>
        )}

        {/* Title (Metro-style overlay) */}
        <span className="metro-tile-title">{tile.title}</span>
      </div>
    </motion.button>
  )
}

export default MetroTile
