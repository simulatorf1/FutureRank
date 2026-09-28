'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from './NotificationBell'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

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

  // Cerrar el menú al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserId(null)
    setIsAnonymous(true)
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const hasRealAccount = userId && !isAnonymous

  const links = [
    { href: '/ranking', label: 'Ranking' },
    { href: '/siguiendo', label: 'Siguiendo' },
    { href: '/salon', label: 'Salón' },
    { href: '/como-funciona', label: 'Cómo funciona' },
    { href: '/faq', label: 'FAQ' },
    { href: '/crear', label: 'Crear pregunta' },
  ]

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Future<span className="text-white/40">Rank</span>
        </Link>

        {/* Escritorio: enlaces horizontales */}
        <nav className="hidden items-center gap-4 text-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-white/60 transition hover:text-white"
            >
              {l.label}
            </Link>
          ))}

          {!loading && <NotificationBell />}

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
        </nav>

        {/* Móvil: botón + campana */}
        <div className="flex items-center gap-3 md:hidden">
          {!loading && <NotificationBell />}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md border border-white/10 p-2 text-white/70 transition hover:bg-white/10"
            aria-label="Menú"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Menú desplegable en móvil */}
      {menuOpen && (
        <nav className="border-t border-white/10 md:hidden">
          <div className="mx-auto flex max-w-5xl flex-col px-4 py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="border-b border-white/5 py-3 text-sm text-white/70 transition hover:text-white"
              >
                {l.label}
              </Link>
            ))}

            {!loading && hasRealAccount && (
              <>
                <Link
                  href={`/u/${userId}`}
                  className="border-b border-white/5 py-3 text-sm text-white/70 transition hover:text-white"
                >
                  Mi perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="py-3 text-left text-sm text-white/40 transition hover:text-white"
                >
                  Salir
                </button>
              </>
            )}

            {!loading && !hasRealAccount && (
              <>
                <Link
                  href="/login"
                  className="border-b border-white/5 py-3 text-sm text-white/70 transition hover:text-white"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="my-3 rounded-md bg-white px-4 py-2 text-center text-sm font-medium text-black transition hover:bg-white/90"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
