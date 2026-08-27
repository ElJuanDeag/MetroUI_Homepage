export type TileSize = "1x1" | "2x1" | "2x2"

export type MetroTile = {
  id: string
  title: string
  slug: string
  externalUrl?: string
  authRequired?: boolean
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
          { id: "about", title: "About", slug: "/about", color: "#0078D4", size: "2x2" },
          { id: "projects", title: "Projects", slug: "/projects", color: "#107C10", size: "2x2" },
          { id: "notes", title: "Notes", slug: "/notes", color: "#D83B01", size: "2x2" },
          { id: "blog", title: "Blog", slug: "/blog", color: "#107C10", size: "2x1" },
          { id: "resume", title: "Resume", slug: "/resume", color: "#0078D4", size: "2x1" },
        ],
      },
      {
        id: "group-secondary",
        columns: 3,
        tiles: [
          { id: "labs", title: "Lab", slug: "/labs", color: "#D83B01", size: "2x1" },
          { id: "one", title: "MetroUI_Homepage", slug: "/one", color: "#4A4A4A", size: "1x1" },
          { id: "two", title: "VPS", slug: "/two", authRequired: true, color: "#107C10", size: "1x1" },
          { id: "three", title: "betelguese", slug: "/three", color: "#0078D4", size: "2x1" },
          { id: "four", title: "TextTT_Dash", slug: "/four", color: "#4A4A4A", size: "1x1" },
          { id: "more", title: "More", slug: "/more", color: "#107C10", size: "1x1" },
        ],
      },
      {
        id: "group-utility",
        columns: 5,
        tiles: [
          { id: "alpha", title: "Clock", slug: "/alpha", color: "#4A4A4A", size: "1x1" },
          { id: "beta", title: "Weather", slug: "/beta", color: "#4A4A4A", size: "1x1" },
          { id: "gamma", title: "Day Progress", slug: "/gamma", color: "#4A4A4A", size: "1x1" },
          { id: "delta", title: "System Info", slug: "/delta", color: "#4A4A4A", size: "1x1" },
          { id: "stats", title: "Stats", slug: "/stats", color: "#4A4A4A", size: "1x1" },
        ],
      },
      {
        id: "group-extras",
        columns: 3,
        tiles: [
          { id: "misc-1", title: "Misc", slug: "/misc", color: "#0078D4", size: "1x1" },
          {
            id: "five",
            title: "Jellyfin",
            slug: "/jellyfin",
            externalUrl: "https://jellyfin.braje.sh",
            authRequired: true,
            color: "#4A4A4A",
            size: "1x1",
          },
          { id: "cabo", title: "Cabo", slug: "/cabo", externalUrl: "https://play.braje.sh", color: "#D83B01", size: "1x1" },
        ],
      },
    ],
  },
]

export const tileSpan = (size: TileSize) => sizeMap[size]
