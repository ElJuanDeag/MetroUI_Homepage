import type { RoomSettings, RoomView, TargetCard } from "./game.js"

export type ClientMessage =
  | { type: "JOIN_ROOM"; roomId: string; name: string; playerToken?: string }
  | { type: "SET_READY"; ready: boolean }
  | { type: "START_GAME" }
  | { type: "DRAW_FROM_DECK" }
  | { type: "DRAW_FROM_DISCARD" }
  | { type: "SWAP_DRAWN_CARD"; cardIndex: number }
  | { type: "DISCARD_DRAWN_CARD" }
  | { type: "RESOLVE_POWER"; first?: TargetCard; second?: TargetCard; swap?: boolean }
  | { type: "CALL_CABO" }
  | { type: "SLAP_DISCARD"; cardIndex: number }
  | { type: "PING" }

export type ServerMessage =
  | { type: "ROOM_CREATED"; roomId: string; inviteUrl: string }
  | { type: "ROOM_STATE"; room: RoomView; playerToken?: string }
  | { type: "ERROR"; message: string }
  | { type: "EVENT"; message: string }
  | { type: "PONG" }

export type CreateRoomRequest = {
  hostName: string
  settings?: Partial<RoomSettings>
}

export type CreateRoomResponse = {
  roomId: string
  inviteUrl: string
}
