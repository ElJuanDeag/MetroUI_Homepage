import { useEffect, useMemo, useRef, useState } from "react"
import type { ClientMessage, RoomView, ServerMessage } from "./types"

const tokenKey = (roomId: string) => `cabo:${roomId}:token`

export function useCaboSocket(roomId: string | null, playerName: string | null) {
  const [room, setRoom] = useState<RoomView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!roomId || !playerName) return
    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws`)
    socketRef.current = socket

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          roomId,
          name: playerName,
          playerToken: localStorage.getItem(tokenKey(roomId)) || undefined,
        } satisfies ClientMessage)
      )
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as ServerMessage
      if (message.type === "ROOM_STATE") {
        setRoom(message.room)
        if (message.playerToken) {
          localStorage.setItem(tokenKey(roomId), message.playerToken)
        }
      }
      if (message.type === "ERROR") setError(message.message)
    }

    socket.onclose = () => {
      setError("Connection lost. Reload within 90 seconds to reclaim your seat.")
    }

    return () => socket.close()
  }, [roomId, playerName])

  const send = useMemo(
    () => (message: ClientMessage) => {
      socketRef.current?.send(JSON.stringify(message))
    },
    []
  )

  return { room, error, send }
}
