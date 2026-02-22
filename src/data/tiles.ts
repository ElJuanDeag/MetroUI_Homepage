export type TileSize = "1x1" | "2x1" | "2x2"

export type MetroTile = {
  id: string
  title: string
  slug: string
  color: string
  size: TileSize
}

export type TileGroup = {
  id: string
  columns: number
  tiles: MetroTile[]
}

export type TileRow = {
  id: string
  groups: TileGroup[]
}

const sizeMap = {
  "1x1": { w: 1, h: 1 },
  "2x1": { w: 2, h: 1 },
  "2x2": { w: 2, h: 2 },
}

export const tileRows: TileRow[] = [
  {
    id: "row-1",
    groups: [
      {
        id: "group-main",
        columns: 4,
        tiles: [
          { id: "about", title: "About", slug: "/about", color: "#0078D7", size: "2x1" },
          { id: "projects", title: "Projects", slug: "/projects", color: "#2D7D46", size: "2x2" },
          { id: "stats", title: "Stats", slug: "/stats", color: "#515C6B", size: "1x1" },
          { id: "notes", title: "Notes", slug: "/notes", color: "#6A4C93", size: "1x1" },
        ],
      },
      {
        id: "group-secondary",
        columns: 2,
        tiles: [
          { id: "blog", title: "Blog", slug: "/blog", color: "#603CBA", size: "2x1" },
          { id: "resume", title: "Resume", slug: "/resume", color: "#038387", size: "2x1" },
          { id: "labs", title: "Labs", slug: "/labs", color: "#D35400", size: "2x2" },
          { id: "misc-1", title: "Misc", slug: "/misc", color: "#8E44AD", size: "1x1" },
          { id: "misc-2", title: "More", slug: "/more", color: "#2C3E50", size: "1x1" },
        ],
      },

      /* New group 1 */
      {
        id: "group-tools",
        columns: 3,
        tiles: [
          { id: "alpha", title: "Clock", slug: "/alpha", color: "#1ABC9C", size: "2x1" },
          { id: "beta", title: "Weather", slug: "/beta", color: "#2980B9", size: "1x1" },
          { id: "gamma", title: "Day Progress", slug: "/gamma", color: "#7F8C8D", size: "1x1" },
          { id: "delta", title: "System Info", slug: "/delta", color: "#C0392B", size: "2x2" },
        ],
      },

      /* New group 2 */
      {
        id: "group-extras",
        columns: 3,
        tiles: [
          { id: "one", title: "MetroUI_Homepage", slug: "/one", color: "#16A085", size: "1x1" },
          { id: "two", title: "VPS", slug: "/two", color: "#27AE60", size: "1x1" },
          { id: "three", title: "betelguese", slug: "/three", color: "#F39C12", size: "2x1" },
          { id: "four", title: "TextTT_Dash", slug: "/four", color: "#8E44AD", size: "1x1" },
          { id: "five", title: "AudioPaneer_v1", slug: "/five", color: "#34495E", size: "1x1" },
        ],
      },
    ],
  },
]

export const tileSpan = (size: TileSize) => sizeMap[size]
