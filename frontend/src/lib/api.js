import axios from 'axios'
import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API] Error:', error.response?.status, error.config?.url, error.response?.data)
    return Promise.reject(error)
  }
)

export const profilesApi = {
  create: (data) => api.post('/profiles', data).then((r) => r.data),
  getMine: () => api.get('/profiles/me').then((r) => r.data),
  updateMine: (data) => api.patch('/profiles/me', data).then((r) => r.data),
  getById: (id) => api.get(`/profiles/${id}`).then((r) => r.data),
  // NOUVEAU : chercher un profil par user_id (UUID Supabase Auth) au lieu de profile.id
  getByUserId: (userId) => api.get(`/profiles/by-user/${userId}`).then((r) => r.data),
  deactivate: () => api.delete('/profiles/me'),
}

export const matchesApi = {
  list: (opts = {}) => api.get('/matches', { params: opts }).then((r) => r.data),
  getWith: (userId, opts = {}) => api.get(`/matches/${userId}`, { params: opts }).then((r) => r.data),
  getDetails: (otherUserId, params = {}) =>
    api.get(`/matches/details/${otherUserId}`, { params }).then((r) => r.data),
  getExplanation: (otherUserId, params = {}) =>
    api.get(`/matches/${otherUserId}/explain`, { params }).then((r) => r.data),
}

export const messagesApi = {
  send: (toUserId, content) =>
    api.post('/messages', { to_user_id: toUserId, content }).then((r) => r.data),
  listConversations: () =>
    api.get('/messages/conversations').then((r) => r.data),
  getConversation: (otherUserId, limit = 100) =>
    api.get(`/messages/${otherUserId}`, { params: { limit } }).then((r) => r.data),
  markAsRead: (otherUserId) =>
    api.patch(`/messages/${otherUserId}/read`).then((r) => r.data),
  getUnreadCount: () =>
    api.get('/messages/unread/count').then((r) => r.data),
}