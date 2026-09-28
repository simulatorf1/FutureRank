'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  getImprobableHits,
  getTopStreaks,
  getTopUsers,
  getHardestQuestions,
  type ImprobableHit,
  type StreakRecord,
  type TopUser,
  type HardQuestion,
} from '@/lib/fame'

export default function HallOfFamePage() {
  const [hits, setHits] = useState<ImprobableHit[]>([])
  const [streaks, setStreaks] = useState<StreakRecord[]>([])
  const [users, setUsers] = useState<TopUser[]>([])
  const [hardest, setHardest] = useState<HardQuestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [h, s, u, d] = await Promise.all([
        getImprobableHits(10),
        getTopStreaks(10),
        getTopUsers(10),
        getHardestQuestions(5),
      ])
      setHits(h)
      setStreaks(s)
      setUsers(u)
      setHardest(d)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">🏛️ Salón de la Fama</h1>
          <p className="text-white/60">
            Las mejores predicciones de la historia de FutureRank.
          </p>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Top usuarios */}
            {users.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-medium">⭐ Top predictores</h2>
                <div className="space-y-2">
                  {users.map((u, i) => (
                    <Link
                      key={u.user_id}
                      href={`/u/${u.user_id}`}
                      className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:bg-white/10"
                    >
                      <span className="w-8 text-center text-lg font-semibold text-white/60">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${u.position}`}
                      </span>
                      <span className="flex-1 font-medium">
                        {u.display_name ?? 'Anónimo'}
                      </span>
                      <span className="text-right text-xs text-white/50">
                        <span className="block text-white/70">
                          {u.total_correct}/{u.total_predictions} · {u.accuracy_percent}%
                        </span>
                        <span className="block">{u.total_points} pts</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Aciertos improbables */}
            {hits.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-medium">
                  🎯 Mayores aciertos improbables
                </h2>
                <p className="mb-4 text-xs text-white/50">
                  Predicciones donde menos del 20% de los votos apuntaban a la opción correcta.
                </p>
                <div className="space-y-2">
                  {hits.map((h, i) => (
                    <div
                      key={`${h.user_id}-${h.question_id}`}
                      className="rounded-lg border border-orange-500/20 bg-orange-500/[0.03] p-4"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="mb-1 text-xs text-orange-400/70">
                            #{i + 1} · Solo el {h.correct_percent}% acertó
                          </div>
                          <Link
                            href={`/pregunta/${h.question_id}`}
                            className="font-medium hover:underline"
                          >
                            {h.question_title}
                          </Link>
                        </div>
                        <div className="shrink-0 rounded bg-orange-500/20 px-2 py-1 text-xs font-medium text-orange-300">
                          +{h.points} pts
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <Link
                          href={`/u/${h.user_id}`}
                          className="hover:text-white"
                        >
                          {h.display_name ?? 'Anónimo'}
                        </Link>
                        <span>
                          {h.correct_votes} de {h.total_votes} votos
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Mejores rachas */}
            {streaks.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-medium">🔥 Mejores rachas históricas</h2>
                <div className="space-y-2">
                  {streaks.map((s, i) => (
                    <Link
                      key={s.user_id}
                      href={`/u/${s.user_id}`}
                      className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:bg-white/10"
                    >
                      <span className="w-8 text-center text-xs text-white/40">#{i + 1}</span>
                      <span className="flex-1 font-medium">
                        {s.display_name ?? 'Anónimo'}
                      </span>
                      <span className="text-lg font-semibold text-orange-400">
                        🔥 {s.best_streak}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Preguntas más difíciles */}
            {hardest.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-medium">🤔 Preguntas más difíciles</h2>
                <p className="mb-4 text-xs text-white/50">
                  Preguntas donde casi nadie acertó la opción correcta.
                </p>
                <div className="space-y-2">
                  {hardest.map((q) => (
                    <Link
                      key={q.question_id}
                      href={`/pregunta/${q.question_id}`}
                      className="block rounded-lg border border-white/10 bg-white/5 p-4 text-sm transition hover:bg-white/10"
                    >
                      <div className="mb-1 font-medium">{q.question_title}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">
                          Solo el {q.correct_percent}% acertó ({q.total_votes} votos)
                        </span>
                        <span className="text-green-400">
                          ✓ {q.correct_option_text}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {(hits.length === 0 && streaks.length === 0 && users.length === 0) && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-white/60">
                  Aún no hay suficientes predicciones resueltas para llenar el Salón de la
                  Fama. Vuelve cuando la comunidad haya resuelto más preguntas.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
