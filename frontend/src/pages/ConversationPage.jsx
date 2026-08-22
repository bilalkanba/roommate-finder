/**
 * ConversationPage v4 — channelKey pour éviter conflit Realtime.
 */

import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { messagesApi, profilesApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { useRealtimeMessages, playNotificationSound } from '@/hooks/useRealtimeMessages'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDayLabel(dateStr, lang) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today.getTime() - 86400000)

  if (date.toDateString() === today.toDateString()) {
    return lang === 'fr' ? 'Aujourd\'hui' : lang === 'es' ? 'Hoy' : lang === 'ar' ? 'اليوم' : 'Today'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return lang === 'fr' ? 'Hier' : lang === 'es' ? 'Ayer' : lang === 'ar' ? 'أمس' : 'Yesterday'
  }
  return date.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' })
}

function groupMessagesByDay(messages) {
  const groups = []
  let currentDay = null

  messages.forEach(msg => {
    const day = new Date(msg.created_at).toDateString()
    if (day !== currentDay) {
      currentDay = day
      groups.push({ day, date: msg.created_at, messages: [] })
    }
    groups[groups.length - 1].messages.push(msg)
  })

  return groups
}

export default function ConversationPage() {
  const { userId: otherUserId } = useParams()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const lang = i18n.language
  const toast = useToast()

  const [messages, setMessages] = useState([])
  const [otherProfile, setOtherProfile] = useState(null)
  const [myUserId, setMyUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const initialLoadDoneRef = useRef(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setMyUserId(data.user?.id)
    })
  }, [])

  useEffect(() => {
    if (!otherUserId) return
    profilesApi.getByUserId(otherUserId)
      .then(setOtherProfile)
      .catch(err => console.error('[profile load]', err))
  }, [otherUserId])

  useEffect(() => {
    if (!otherUserId) return

    async function loadInitial() {
      try {
        const data = await messagesApi.getConversation(otherUserId)
        setMessages(data.messages || [])
        await messagesApi.markAsRead(otherUserId).catch(() => {})
      } catch (err) {
        toast.error(lang === 'fr' ? 'Erreur de chargement' : 'Loading error')
      } finally {
        setLoading(false)
        initialLoadDoneRef.current = true
      }
    }

    loadInitial()
  }, [otherUserId, lang])

  // FIX : channelKey UNIQUE pour ConversationPage
  useRealtimeMessages({
    userId: myUserId,
    otherUserId,
    channelKey: 'conv',
    enabled: !!myUserId && !!otherUserId,
    onNewMessage: async (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev
        const filtered = prev.filter(m =>
          !(m._optimistic && m.content === newMsg.content && m.from_user_id === newMsg.from_user_id)
        )
        return [...filtered, newMsg]
      })

      if (newMsg.to_user_id === myUserId) {
        messagesApi.markAsRead(otherUserId).catch(() => {})
        if (document.hidden) {
          playNotificationSound()
        }
      }
    },
    onUpdatedMessage: (updatedMsg) => {
      setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m))
    },
  })

  useEffect(() => {
    if (!initialLoadDoneRef.current) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    if (initialLoadDoneRef.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
    }
  }, [loading])

  const handleSend = async () => {
    const content = inputValue.trim()
    if (!content || sending || !otherUserId) return

    setSending(true)

    const optimisticMsg = {
      id: `tmp-${Date.now()}`,
      from_user_id: myUserId,
      to_user_id: otherUserId,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
      _optimistic: true,
    }
    setMessages(prev => [...prev, optimisticMsg])
    setInputValue('')

    try {
      const savedMsg = await messagesApi.send(otherUserId, content)
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? savedMsg : m))
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      console.error('[send message]', err)
      toast.error(lang === 'fr' ? 'Erreur d\'envoi' : lang === 'es' ? 'Error de envío' : lang === 'ar' ? 'خطأ في الإرسال' : 'Send error')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading && !messages.length) {
    return <ConversationLoadingSkeleton />
  }

  const grouped = groupMessagesByDay(messages)
  const initials = getInitials(otherProfile?.full_name)

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate('/messages')}
            className="btn-icon shrink-0"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => navigate(`/profile/${otherProfile?.id || otherUserId}`)}
            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm shadow-md overflow-hidden shrink-0">
              {otherProfile?.avatar_url ? (
                <img src={otherProfile.avatar_url} alt={otherProfile.full_name} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-neutral-900 truncate">
                {otherProfile?.full_name || (lang === 'fr' ? 'Utilisateur' : 'User')}
              </h2>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {lang === 'fr' ? 'En ligne' : lang === 'es' ? 'En línea' : lang === 'ar' ? 'متصل' : 'Online'}
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && !loading && (
            <EmptyConversation lang={lang} otherName={otherProfile?.full_name?.split(' ')[0]} />
          )}

          {grouped.map(group => (
            <div key={group.day}>
              <div className="flex justify-center mb-4">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-neutral-200">
                  {formatDayLabel(group.date, lang)}
                </span>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {group.messages.map((msg, i) => {
                    const isMe = msg.from_user_id === myUserId
                    const prevMsg = i > 0 ? group.messages[i - 1] : null
                    const isFirstOfBlock = !prevMsg || prevMsg.from_user_id !== msg.from_user_id
                    return (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isMe={isMe}
                        isFirstOfBlock={isFirstOfBlock}
                      />
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lang === 'fr' ? 'Écris un message...' : lang === 'es' ? 'Escribe un mensaje...' : lang === 'ar' ? 'اكتب رسالة...' : 'Write a message...'}
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 max-h-32"
              disabled={sending}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputValue.trim() || sending}
              className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Send"
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, isMe, isFirstOfBlock }) {
  const time = formatTime(message.created_at)

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] md:max-w-[60%] px-4 py-2 rounded-2xl shadow-sm ${
          isMe
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
            : 'bg-white text-neutral-800 border border-neutral-100'
        } ${isFirstOfBlock ? 'mt-3' : 'mt-0.5'} ${
          isMe ? 'rounded-br-md' : 'rounded-bl-md'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-white/70' : 'text-neutral-400'}`}>
          <span>{time}</span>
          {isMe && (
            <span>
              {message.read_at ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function EmptyConversation({ lang, otherName }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="text-5xl mb-4">👋</div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {lang === 'fr'
          ? `Démarre la conversation${otherName ? ` avec ${otherName}` : ''}`
          : lang === 'es'
          ? `Empieza la conversación${otherName ? ` con ${otherName}` : ''}`
          : lang === 'ar'
          ? 'ابدأ المحادثة'
          : `Start a conversation${otherName ? ` with ${otherName}` : ''}`}
      </h3>
      <p className="text-sm text-neutral-500 max-w-xs mx-auto">
        {lang === 'fr' ? 'Écris ton premier message ci-dessous.'
          : lang === 'es' ? 'Escribe tu primer mensaje.'
          : lang === 'ar' ? 'اكتب رسالتك الأولى.'
          : 'Write your first message below.'}
      </p>
    </div>
  )
}

function ConversationLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="bg-white border-b border-neutral-200 h-16 flex items-center px-4">
        <div className="w-10 h-10 rounded-full animate-shimmer mr-3"></div>
        <div className="w-32 h-4 animate-shimmer rounded"></div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className={`h-10 rounded-2xl animate-shimmer ${i % 2 === 0 ? 'w-32' : 'w-48'}`}></div>
          </div>
        ))}
      </div>
    </div>
  )
}   