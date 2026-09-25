'use client'

import Link from 'next/link'

export function AnonymousConversionPrompt() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-white/80">
        <strong className="text-white">Tu voto está guardado.</strong> Crea una cuenta
        para que cuente en tu historial y aparezcas en el ranking.
      </p>
      <div className="mt-3 flex gap-2">
        <Link
          href="/registro"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Crear cuenta
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          Ya tengo cuenta
        </Link>
      </div>
    </div>
  )
}
