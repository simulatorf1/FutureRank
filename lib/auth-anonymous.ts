import { createClient } from '@/lib/supabase/client'

export async function ensureAnonymousSession() {
  const supabase = createClient()
  
  // 1. Comprobar si ya hay sesión (anónima o registrada)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    return { session, isAnonymous: session.user.is_anonymous ?? false }
  }

  // 2. Si no hay sesión, crear una anónima
  const { data, error } = await supabase.auth.signInAnonymously()
  
  if (error) {
    console.error('Error creating anonymous session:', error)
    return { session: null, isAnonymous: false }
  }

  return { session: data.session, isAnonymous: true }
}
