'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'

export default function RegistroPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const wasAnonymous = currentUser?.is_anonymous ?? false

    // Si venía de anónimo, convertir ese usuario en permanente
    if (wasAnonymous) {
      const { error: updateError } = await supabase.auth.updateUser({
        email,
        password,
        data: { display_name: displayName || 'Anónimo' },
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      // Registro nuevo desde cero
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || 'Anónimo' },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/'), 1500)
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-sm text-white/60">
            Revisa tu correo para confirmar la cuenta. Redirigiendo...
          </p>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="mb-2 text-2xl font-semibold">Crear cuenta</h1>
        <p className="mb-8 text-sm text-white/60">
          Guarda tu historial, compite en el ranking y demuestra quién predice mejor.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/60">Nombre público</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Cómo te verán los demás"
              maxLength={50}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
            />
          </div>
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
              minLength={6}
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
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-white/70 hover:text-white">
            Inicia sesión
          </Link>
        </p>
      </main>
    </>
  )
}
