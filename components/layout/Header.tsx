'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function Header() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
      setIsAnonymous(user?.is_anonymous ?? true)
      setLoading(false)
    }
    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
      setIsAnonymous(session?.user.is_anonymous ?? true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserId(null)
    setIsAnonymous(true)
    router.push('/')
    router.refresh()
  }

  const hasRealAccount = userId && !isAnonymous

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Future<span className="text-white/40">Rank</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/ranking"
            className="hidden text-white/60 transition hover:text-white sm:inline"
          >
            Ranking
          </Link>
          <Link
            href="/como-funciona"
            className="hidden text-white/60 transition hover:text-white md:inline"
          >
            Cómo funciona
          </Link>
          <Link
            href="/faq"
            className="hidden text-white/60 transition hover:text-white md:inline"
          >
            FAQ
          </Link>

          {!loading && hasRealAccount && (
            <>
              <Link
                href={`/u/${userId}`}
                className="text-white/60 transition hover:text-white"
              >
                Mi perfil
              </Link>
              <button
                onClick={handleLogout}
                className="text-white/40 transition hover:text-white"
              >
                Salir
              </button>
            </>
          )}

          {!loading && !hasRealAccount && (
            <>
              <Link
                href="/login"
                className="text-white/60 transition hover:text-white"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-md bg-white px-3 py-1.5 font-medium text-black transition hover:bg-white/90"
              >
                Crear cuenta
              </Link>
            </>
          )}

          <Link
            href="/crear"
            className="hidden text-white/60 transition hover:text-white sm:inline"
          >
            Crear pregunta
          </Link>
        </nav>
      </div>
    </header>
  )
}
