'use client'

import { useState } from 'react'
import { convertAnonymousToPermanent } from '@/lib/auth-convert'

export function AnonymousConversionPrompt({ voteCount }: { voteCount: number }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      await convertAnonymousToPermanent(email)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
        <p className="text-sm">Revisa tu correo para confirmar la cuenta. Tu historial de {voteCount} votos se conservará.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-white/70">
        Llevas <strong>{voteCount}</strong> predicciones. Crea una cuenta para guardar tu historial y aparecer en el ranking.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          className="flex-1 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Crear cuenta'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-400">
          Ese email ya está registrado. Prueba con otro o inicia sesión.
        </p>
      )}
    </div>
  )
}
