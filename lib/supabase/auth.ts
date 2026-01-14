/**
 * Auth utility functions for Supabase
 */

import { createClient } from './client'
import type { Provider } from '@supabase/supabase-js'

const supabase = createClient()

export type AuthError = {
  message: string
  status?: number
}

export type AuthResult<T = void> = {
  data: T | null
  error: AuthError | null
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      data: null,
      error: { message: error.message, status: error.status },
    }
  }

  return { data: null, error: null }
}

/**
 * Get the base URL for auth redirects
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  // Fallback for SSR - use env variable
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback`,
    },
  })

  if (error) {
    return {
      data: null,
      error: { message: error.message, status: error.status },
    }
  }

  return { data: null, error: null }
}

/**
 * Sign in with OAuth provider (Google, GitHub, etc.)
 */
export async function signInWithOAuth(provider: Provider): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`,
    },
  })

  if (error) {
    return {
      data: null,
      error: { message: error.message, status: error.status },
    }
  }

  return { data: null, error: null }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      data: null,
      error: { message: error.message, status: error.status },
    }
  }

  return { data: null, error: null }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl()}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return {
      data: null,
      error: { message: error.message, status: error.status },
    }
  }

  return { data: null, error: null }
}

/**
 * Update user password (when logged in or after reset)
 */
export async function updatePassword(password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return {
      data: null,
      error: { message: error.message, status: error.status },
    }
  }

  return { data: null, error: null }
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  return { session: data.session, error }
}

/**
 * Get current user
 */
export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  return { user: data.user, error }
}
