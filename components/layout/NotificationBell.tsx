'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getUnreadCount } from '@/lib/notifications'

export function NotificationBell() {
  const [count, setCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
      if (user) {
        const c = await getUnreadCount()
        setCount(c)
      }
    }
    init()

    // Refresca el contador cada 30 segundos
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const c = await getUnreadCount()
        setCount(c)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  if (!userId) return null

  return (
    <Link
      href="/notificaciones"
      className="relative text-white/60 transition hover:text-white"
      aria-label="Notificaciones"
    >
      <span className="text-lg">🔔</span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
