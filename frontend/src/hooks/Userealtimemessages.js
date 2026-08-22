/**
 * useRealtimeMessages v3 — Fix : canal unique par composant.
 *
 * Bug v2 : Navbar et MessagesPage créaient le même canal "messages:all:UUID"
 *          → Supabase rejette la 2e subscription.
 *
 * Fix v3 : chaque appelant passe un channelKey unique.
 *          Exemples : 'navbar', 'list', 'conv'
 */

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeMessages({
  userId,
  otherUserId = null,
  channelKey = 'default', // NOUVEAU : identifiant unique par instance
  onNewMessage = null,
  onUpdatedMessage = null,
  enabled = true,
}) {
  const onNewMessageRef = useRef(onNewMessage)
  const onUpdatedMessageRef = useRef(onUpdatedMessage)
  const channelRef = useRef(null)

  useEffect(() => {
    onNewMessageRef.current = onNewMessage
    onUpdatedMessageRef.current = onUpdatedMessage
  }, [onNewMessage, onUpdatedMessage])

  useEffect(() => {
    if (!enabled || !userId) return

    // Nom de canal UNIQUE par composant + user (+ éventuellement conversation)
    // Ex: 'messages:navbar:UUID', 'messages:list:UUID', 'messages:conv:UUID:OTHERUUID'
    const channelName = otherUserId
      ? `messages:${channelKey}:${userId}:${otherUserId}`
      : `messages:${channelKey}:${userId}`

    const handleInsert = (payload) => {
      const msg = payload.new
      if (!msg) return

      const isForMe = msg.to_user_id === userId
      const isFromMe = msg.from_user_id === userId
      if (!isForMe && !isFromMe) return

      if (otherUserId) {
        const isRelevant =
          (msg.from_user_id === userId && msg.to_user_id === otherUserId) ||
          (msg.from_user_id === otherUserId && msg.to_user_id === userId)
        if (!isRelevant) return
      }

      onNewMessageRef.current?.(msg)
    }

    const handleUpdate = (payload) => {
      const msg = payload.new
      if (!msg) return

      const isForMe = msg.to_user_id === userId
      const isFromMe = msg.from_user_id === userId
      if (!isForMe && !isFromMe) return

      if (otherUserId) {
        const isRelevant =
          (msg.from_user_id === userId && msg.to_user_id === otherUserId) ||
          (msg.from_user_id === otherUserId && msg.to_user_id === userId)
        if (!isRelevant) return
      }

      onUpdatedMessageRef.current?.(msg)
    }

    // Chainage direct : .on().on().subscribe()
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        handleInsert
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        handleUpdate
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Subscribed to ${channelName}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] Channel error for ${channelName}`)
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [userId, otherUserId, channelKey, enabled])
}


export function playNotificationSound(volume = 0.15) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const notes = [
      { freq: 800, duration: 0.08, delay: 0 },
      { freq: 1200, duration: 0.12, delay: 0.06 },
    ]

    notes.forEach(({ freq, duration, delay }) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.value = freq

      gainNode.gain.setValueAtTime(0, ctx.currentTime + delay)
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)

      oscillator.start(ctx.currentTime + delay)
      oscillator.stop(ctx.currentTime + delay + duration)
    })
  } catch (err) {
    console.debug('[Sound] Notification sound skipped:', err.message)
  }
}