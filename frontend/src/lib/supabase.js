/**
 * Client Supabase pour le frontend.
 *
 * Supabase gère pour nous :
 * - L'inscription / connexion
 * - Les JWT (stockés auto dans localStorage)
 * - Le refresh des tokens
 *
 * Usage :
 *   import { supabase } from '@/lib/supabase'
 *   const { data, error } = await supabase.auth.signInWithPassword({ email, password })
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables Supabase manquantes. Vérifie ton fichier frontend/.env (VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY)'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
