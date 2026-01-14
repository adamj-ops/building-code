/**
 * Supabase Client - Browser-side client
 * Use this in Client Components and React hooks
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export function createClient() {
  return createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
}

// Singleton instance for convenience
let browserClient: ReturnType<typeof createClient> | null = null

export function getClient() {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}

// Check if Supabase is properly configured
export function isSupabaseConfigured() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
}
