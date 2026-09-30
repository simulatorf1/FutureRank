'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function Tracker() {
  const pathname = usePathname()

  useEffect(() => {
    async function track() {
      if (pathname.startsWith('/admin')) return
      if (process.env.NODE_ENV !== 'production') return

      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || null,
            userId: session?.user?.id ?? null,
            isAnonymous: session?.user?.is_anonymous ?? true,
          }),
        })
      } catch {
        // silencioso
      }
    }
    track()
  }, [pathname])

  return null
}
