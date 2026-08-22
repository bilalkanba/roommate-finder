/**
 * MessagesPage v3 — channelKey pour éviter conflit Realtime.
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { messagesApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { useRealtimeMessages, playNotificationSound } from '@/hooks/useRealtimeMessages'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatRelativeTime(dateStr, lang) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return lang === 'fr' ? 'À l\'instant' : lang === 'es' ? 'Ahora' : lang === 'ar' ? 'الآن' : 'Now'
  if (diffMin < 60) return `${diffMin}m`
  if (diffH < 24) return `${diffH}h`
  if (diffD < 7) return `${diffD}j`

  return date.toLocaleDateString(lang, { day: '2-digit', month: '2-digit' })
}

export default function MessagesPage() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const lang = i18n.language
  const toast = useToast()

  const [conversations, setConversations] = useState([])
  const [myUserId, setMyUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setMyUserId(data.user?.id)
    })
  }, [])

  const load = async () => {
    try {
      const data = await messagesApi.listConversations()
      setConversations(data.conversations || [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // FIX : channelKey UNIQUE pour MessagesPage
  useRealtimeMessages({
    userId: myUserId,
    channelKey: 'list',
    enabled: !!myUserId,
    onNewMessage: (newMsg) => {
      load()
      if (newMsg.to_user_id === myUserId && document.hidden) {
        playNotificationSound()
      }
      if (newMsg.to_user_id === myUserId && !document.hidden) {
        toast.info(
          lang === 'fr' ? 'Nouveau message reçu' :
          lang === 'es' ? 'Nuevo mensaje recibido' :
          lang === 'ar' ? 'رسالة جديدة' :
          'New message received'
        )
      }
    },
  })

  const filtered = search
    ? conversations.filter(c =>
        (c.other_user_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.last_message || '').toLowerCase().includes(search.toLowerCase())
      )
    : conversations

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)

  if (loading) return <MessagesLoadingSkeleton />

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-semibold mb-2">
          {lang === 'fr' ? 'Erreur de chargement' : 'Loading error'}
        </h2>
        <p className="text-neutral-600 text-sm mb-6">{typeof error === 'string' ? error : 'Unknown error'}</p>
        <button onClick={load} className="btn-primary-premium">
          {lang === 'fr' ? 'Réessayer' : 'Retry'}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif-display leading-tight">
                {lang === 'fr' ? 'Messages' : lang === 'es' ? 'Mensajes' : lang === 'ar' ? 'الرسائل' : 'Messages'}
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                {conversations.length === 0
                  ? (lang === 'fr' ? 'Aucune conversation' : lang === 'es' ? 'Sin conversaciones' : lang === 'ar' ? 'لا محادثات' : 'No conversations')
                  : `${conversations.length} ${lang === 'fr' ? 'conversation' + (conversations.length > 1 ? 's' : '') : 'conversations'}`}
              </p>
            </div>
            {totalUnread > 0 && (
              <div className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow-md">
                {totalUnread} {lang === 'fr' ? 'non lu' + (totalUnread > 1 ? 's' : '') : 'unread'}
              </div>
            )}
          </div>

          {conversations.length > 0 && (
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'fr' ? 'Rechercher...' : lang === 'es' ? 'Buscar...' : lang === 'ar' ? 'بحث...' : 'Search...'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}
        </div>

        {conversations.length === 0 ? (
          <EmptyState lang={lang} onExplore={() => navigate('/matches')} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 text-sm">
            {lang === 'fr' ? 'Aucun résultat pour cette recherche' : 'No search results'}
          </div>
        ) : (
          <div className="card-premium overflow-hidden" style={{ padding: 0 }}>
            {filtered.map((conv, i) => (
              <ConversationItem
                key={conv.other_user_id}
                conv={conv}
                onClick={() => navigate(`/messages/${conv.other_user_id}`)}
                lang={lang}
                isLast={i === filtered.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ConversationItem({ conv, onClick, lang, isLast }) {
  const hasUnread = conv.unread_count > 0
  const initials = getInitials(conv.other_user_name)
  const time = formatRelativeTime(conv.last_message_at, lang)

  return (
    <motion.button
      whileHover={{ backgroundColor: 'rgba(240, 253, 250, 0.6)' }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
        !isLast ? 'border-b border-neutral-100' : ''
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm shadow-md overflow-hidden">
          {conv.other_user_avatar ? (
            <img
              src={conv.other_user_avatar}
              alt={conv.other_user_name}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        {hasUnread && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
            {conv.unread_count > 99 ? '99+' : conv.unread_count}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <h3 className={`text-sm truncate ${hasUnread ? 'font-bold text-neutral-900' : 'font-semibold text-neutral-800'}`}>
            {conv.other_user_name || (lang === 'fr' ? 'Utilisateur' : 'User')}
          </h3>
          <span className="text-[11px] text-neutral-500 shrink-0">
            {time}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {conv.last_message_from_me && (
            <span className="text-xs text-neutral-400 shrink-0">
              {lang === 'fr' ? 'Toi:' : lang === 'es' ? 'Tú:' : lang === 'ar' ? 'أنت:' : 'You:'}
            </span>
          )}
          <p className={`text-xs truncate ${hasUnread && !conv.last_message_from_me ? 'text-neutral-700 font-medium' : 'text-neutral-500'}`}>
            {conv.last_message}
          </p>
        </div>
      </div>
    </motion.button>
  )
}

function EmptyState({ lang, onExplore }) {
  return (
    <div className="card-premium text-center py-12 px-6">
      <div className="text-6xl mb-4">💬</div>
      <h2 className="text-2xl font-serif-display mb-2">
        {lang === 'fr' ? 'Aucune conversation'
          : lang === 'es' ? 'Sin conversaciones'
          : lang === 'ar' ? 'لا محادثات بعد'
          : 'No conversations yet'}
      </h2>
      <p className="text-sm text-neutral-600 mb-6 max-w-sm mx-auto">
        {lang === 'fr' ? 'Envoie un message à un de tes matches pour démarrer une conversation.'
          : lang === 'es' ? 'Envía un mensaje a uno de tus matches para empezar.'
          : lang === 'ar' ? 'أرسل رسالة إلى أحد مطابقاتك للبدء.'
          : 'Send a message to one of your matches to start a conversation.'}
      </p>
      <button onClick={onExplore} className="btn-primary-premium hover:scale-[1.02] active:scale-[0.98] transition-transform">
        {lang === 'fr' ? 'Voir mes matches' : lang === 'es' ? 'Ver mis matches' : lang === 'ar' ? 'شاهد مطابقاتي' : 'View my matches'}
      </button>
    </div>
  )
}

function MessagesLoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="h-10 w-40 animate-shimmer rounded-2xl mb-2"></div>
        <div className="h-4 w-24 animate-shimmer rounded"></div>
      </div>
      <div className="card-premium" style={{ padding: 0 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 border-b border-neutral-100 last:border-0">
            <div className="w-12 h-12 rounded-full animate-shimmer shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-shimmer rounded"></div>
              <div className="h-3 w-3/4 animate-shimmer rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}