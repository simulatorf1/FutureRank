'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // 1. Comprobar si el usuario actual es anónimo
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const wasAnonymous = currentUser?.is_anonymous ?? false
    const anonId = currentUser?.id ?? null

    // 2. Intentar login
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    // 3. Si venía de sesión anónima, fusionar votos y comentarios
    if (wasAnonymous && anonId && data.user) {
      await supabase.rpc('merge_anonymous_activity', {
        p_anon_id: anonId,
        p_real_id: data.user.id,
      })
    }

    router.push('/')
    router.refresh()
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="mb-2 text-2xl font-semibold">Iniciar sesión</h1>
        <p className="mb-8 text-sm text-white/60">
          Accede para recuperar tu historial y tu reputación.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/60">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/60">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-2.5 font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="text-white/70 hover:text-white">
            Regístrate
          </Link>
        </p>
      </main>
    </>
  )
}
