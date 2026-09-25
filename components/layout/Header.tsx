'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function Header() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id ?? null)
    })
  }, [])

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Future<span className="text-white/40">Rank</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/ranking" className="text-white/60 transition hover:text-white">
            Ranking
          </Link>
          {userId && (
            <Link
              href={`/u/${userId}`}
              className="text-white/60 transition hover:text-white"
            >
              Mi perfil
            </Link>
          )}
          <Link
            href="/crear"
            className="rounded-md bg-white px-3 py-1.5 font-medium text-black transition hover:bg-white/90"
          >
            Crear pregunta
          </Link>
        </nav>
      </div>
    </header>
  )
}
