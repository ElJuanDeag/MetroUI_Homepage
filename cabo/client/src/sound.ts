import { useEffect, useMemo, useRef, useState } from "react"
import type { RoomView } from "./types"

const STORAGE_KEY = "cabo:muted"

type Tone = {
  frequency: number
  duration: number
  type?: OscillatorType
}

const playTone = (context: AudioContext, tone: Tone, volume = 0.04) => {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = tone.type ?? "sine"
  oscillator.frequency.value = tone.frequency
  gain.gain.setValueAtTime(volume, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + tone.duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + tone.duration)
}

const playSequence = (context: AudioContext, tones: Tone[]) => {
  let offset = 0
  for (const tone of tones) {
    window.setTimeout(() => playTone(context, tone), offset * 1000)
    offset += tone.duration * 0.65
  }
}

export const useSoundManager = (room: RoomView | null) => {
  const [muted, setMuted] = useState(() => localStorage.getItem(STORAGE_KEY) === "true")
  const [enabled, setEnabled] = useState(false)
  const contextRef = useRef<AudioContext | null>(null)
  const previousStateRef = useRef<{
    pendingDrawId?: string
    topDiscardId?: string
    turnPlayerId?: string
    lastLog?: string
  }>({})

  useEffect(() => {
    const unlock = () => {
      if (!contextRef.current) {
        contextRef.current = new window.AudioContext()
      }
      void contextRef.current.resume()
      setEnabled(true)
    }

    window.addEventListener("pointerdown", unlock, { once: true })
    window.addEventListener("keydown", unlock, { once: true })
    return () => {
      window.removeEventListener("pointerdown", unlock)
      window.removeEventListener("keydown", unlock)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(muted))
  }, [muted])

  useEffect(() => {
    if (!room || muted || !enabled || !contextRef.current) {
      previousStateRef.current = {
        pendingDrawId: room?.pendingDraw?.card?.id,
        topDiscardId: room?.topDiscard?.id,
        turnPlayerId: room?.turnPlayerId,
        lastLog: room?.messageLog.at(-1),
      }
      return
    }

    const previous = previousStateRef.current
    const current = {
      pendingDrawId: room.pendingDraw?.card?.id,
      topDiscardId: room.topDiscard?.id,
      turnPlayerId: room.turnPlayerId,
      lastLog: room.messageLog.at(-1),
    }

    if (current.pendingDrawId && current.pendingDrawId !== previous.pendingDrawId) {
      playSequence(contextRef.current, [{ frequency: 420, duration: 0.1, type: "triangle" }])
    }

    if (current.topDiscardId && current.topDiscardId !== previous.topDiscardId) {
      playSequence(contextRef.current, [{ frequency: 320, duration: 0.08, type: "square" }])
    }

    if (current.turnPlayerId !== previous.turnPlayerId && current.turnPlayerId === room.selfPlayerId) {
      playSequence(contextRef.current, [
        { frequency: 660, duration: 0.08, type: "sine" },
        { frequency: 880, duration: 0.1, type: "sine" },
      ])
    }

    if (current.lastLog !== previous.lastLog) {
      if (current.lastLog?.includes("slapped correctly")) {
        playSequence(contextRef.current, [
          { frequency: 720, duration: 0.07, type: "triangle" },
          { frequency: 960, duration: 0.09, type: "triangle" },
        ])
      } else if (current.lastLog?.includes("slapped incorrectly")) {
        playSequence(contextRef.current, [{ frequency: 190, duration: 0.16, type: "sawtooth" }])
      } else if (current.lastLog?.includes("peeked")) {
        playSequence(contextRef.current, [{ frequency: 540, duration: 0.08, type: "triangle" }])
      }
    }

    previousStateRef.current = current
  }, [enabled, muted, room])

  return useMemo(
    () => ({
      muted,
      toggleMuted: () => setMuted((current) => !current),
    }),
    [muted]
  )
}
