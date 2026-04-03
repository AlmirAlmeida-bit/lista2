import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────
// Cole aqui as suas credenciais do Supabase.
// Acesse: https://supabase.com → seu projeto → Project Settings → API
// ─────────────────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabaseConfigurado =
  supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 10

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
)
