'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'

type ProfileData = {
  id: string
  username: string | null
  display_name: string | null
  bio: string | null
  total_predictions: number
  total_correct: number
  total_points: number
  current_streak: number
  best_streak: number
}

type HistoryItem = {
  id: number
  question_id: number
  question_title: string
  points: number
  is_correct: boolean
  created_at: string
}

function ProfileContent() {
  const params = useParams()
  const userId = String(params.id)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [globalPosition, setGlobalPosition] = useState<number | null>(null)
  const [categoryRanks, setCategoryRanks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [profRes, histRes, rankRes, catRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase
          .from('user_scoring_history')
          .select('*')
          .eq('user_id', userId)
          .limit(20),
        supabase
          .from('ranking_global')
          .select('position, total_points')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('user_category_stats')
          .select('*')
          .eq('user_id', userId)
          .order('position')
          .limit(10),
      ])

      setProfile(profRes.data)
      setHistory(histRes.data ?? [])
      setGlobalPosition(rankRes.data?.position ?? null)
      setCategoryRanks(catRes.data ?? [])
      setLoading(false)
    }
    if (userId) load()
  }, [userId])

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-white/60">Cargando perfil...</p>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-white/60">Perfil no encontrado.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-white/40 hover:text-white">
          ← Volver a la portada
        </Link>
      </main>
    )
  }

  const accuracy =
    profile.total_predictions > 0
      ? Math.round((profile.total_correct / profile.total_predictions) * 100)
      : 0

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {profile.display_name ?? 'Anónimo'}
          </h1>
          {profile.username && (
            <p className="text-sm text-white/40">@{profile.username}</p>
          )}
          {profile.bio && (
            <p className="mt-3 max-w-lg text-sm text-white/60">{profile.bio}</p>
          )}
        </div>
        {globalPosition && (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-right">
            <div className="text-xs text-white/40">Posición global</div>
            <div className="text-2xl font-semibold">#{globalPosition}</div>
          </div>
        )}
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Predicciones" value={profile.total_predictions} />
        <Stat label="Aciertos" value={profile.total_correct} />
        <Stat label="Precisión" value={`${accuracy}%`} />
        <Stat label="Puntos" value={profile.total_points} />
      </div>

      {categoryRanks.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-medium">Rankings por categoría</h2>
          <div className="space-y-2">
            {categoryRanks.map((r) => (
              <Link
                key={`${r.category_id}`}
                href={`/categoria/${r.category_slug}`}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
              >
                <span>{r.category_name}</span>
                <span className="text-white/60">
                  #{r.position} · {r.correct_predictions}/{r.resolved_predictions}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-medium">Historial reciente</h2>
          <div className="space-y-2">
            {history.map((h) => (
              <Link
                key={h.id}
                href={`/pregunta/${h.question_id}`}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:bg-white/10"
              >
                <span className="flex-1 pr-4">{h.question_title}</span>
                <span
                  className={`shrink-0 font-medium ${
                    h.is_correct ? 'text-green-400' : 'text-white/40'
                  }`}
                >
                  {h.is_correct ? `+${h.points}` : '0'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {history.length === 0 && (
        <p className="text-sm text-white/40">
          Aún no tiene predicciones resueltas.
        </p>
      )}
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <>
      <Header />
      <Suspense fallback={<main className="p-12">Cargando...</main>}>
        <ProfileContent />
      </Suspense>
    </>
  )
}
