'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getFollowedPredictions, type FollowedPrediction } from '@/lib/follows'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

export default function FollowingPage() {
  const [predictions, setPredictions] = useState<FollowedPrediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getFollowedPredictions()
      setPredictions(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-6 text-2xl font-semibold">Siguiendo</h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : predictions.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
            <p className="mb-3 text-sm text-white/60">
              Aún no sigues a nadie o la gente que sigues no tiene predicciones resueltas.
            </p>
            <Link
              href="/ranking"
              className="inline-block rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Ver el ranking
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {predictions.map((p) => (
              <Link
                key={p.id}
                href={`/pregunta/${p.question_id}`}
                className="block rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <div className="mb-2 flex items-center justify-between text-xs">
                  <Link
                    href={`/u/${p.user_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium text-white/70 hover:text-white"
                  >
                    {p.display_name ?? 'Anónimo'}
                  </Link>
                  <span className="text-white/30">{timeAgo(p.created_at)}</span>
                </div>
                <p className="text-sm text-white/80">{p.question_title}</p>
                <div className="mt-2 text-xs">
                  <span
                    className={p.is_correct ? 'text-green-400' : 'text-white/40'}
                  >
                    {p.is_correct ? `✅ Acertó · +${p.points} puntos` : '❌ Falló'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
