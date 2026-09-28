'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CategoryBar } from '@/components/categories/CategoryBar'
import { StatsBanner } from '@/components/layout/StatsBanner'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { AdSlot } from '@/components/ads/AdSlot'
import {
  getClosingSoonQuestions,
  getTrendingQuestions,
  getRecentQuestions,
  getRecentlyResolvedQuestions,
  getTopPredictors,
  getTopCategories,
  type QuestionCard as QuestionCardType,
} from '@/lib/questions'

type Predictor = {
  user_id: string
  display_name: string | null
  username: string | null
  total_points: number
  position: number
}

export default function HomePage() {
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([])
  const [closingSoon, setClosingSoon] = useState<QuestionCardType[]>([])
  const [trending, setTrending] = useState<QuestionCardType[]>([])
  const [recent, setRecent] = useState<QuestionCardType[]>([])
  const [resolved, setResolved] = useState<QuestionCardType[]>([])
  const [predictors, setPredictors] = useState<Predictor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [cats, closing, trend, rec, res, top] = await Promise.all([
        getTopCategories(),
        getClosingSoonQuestions(6),
        getTrendingQuestions(6),
        getRecentQuestions(6),
        getRecentlyResolvedQuestions(4),
        getTopPredictors(5),
      ])
      setCategories(cats)
      setClosingSoon(closing)
      setTrending(trend)
      setRecent(rec)
      setResolved(res)
      setPredictors(top)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <section className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            ¿Tenías razón?
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-white/60">
            Vota predicciones sobre el futuro y construye tu reputación acierto a acierto.
            Sin apuestas, sin dinero, solo tu historial.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#preguntas"
              className="rounded-md bg-white px-6 py-2.5 font-medium text-black transition hover:bg-white/90"
            >
              Empezar a votar
            </a>
            <Link
              href="/como-funciona"
              className="rounded-md border border-white/10 px-6 py-2.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Cómo funciona
            </Link>
          </div>
        </section>

        <StatsBanner />

        <CategoryBar categories={categories} />

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : (
          <div id="preguntas" className="grid gap-10 lg:grid-cols-3">
            {/* Columna principal */}
            <div className="space-y-10 lg:col-span-2">
              {closingSoon.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-medium">⏰ Próximas a cerrar</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {closingSoon.map((q) => (
                      <QuestionCard
                        key={q.id}
                        id={q.id}
                        title={q.title}
                        description={q.description}
                        categoryName={q.category_name}
                        resolutionDate={q.resolution_date}
                        status={q.status}
                      />
                    ))}
                  </div>
                </section>
              )}

              {trending.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-medium">🔥 Tendencias</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {trending.map((q) => (
                      <QuestionCard
                        key={q.id}
                        id={q.id}
                        title={q.title}
                        description={q.description}
                        categoryName={q.category_name}
                        resolutionDate={q.resolution_date}
                        status={q.status}
                      />
                    ))}
                  </div>
                </section>
              )}

              {recent.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-medium">✨ Nuevas</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {recent.map((q) => (
                      <QuestionCard
                        key={q.id}
                        id={q.id}
                        title={q.title}
                        description={q.description}
                        categoryName={q.category_name}
                        resolutionDate={q.resolution_date}
                        status={q.status}
                      />
                    ))}
                  </div>
                </section>
              )}

              {resolved.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-medium">✅ Resueltas recientes</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {resolved.map((q) => (
                      <QuestionCard
                        key={q.id}
                        id={q.id}
                        title={q.title}
                        description={q.description}
                        categoryName={q.category_name}
                        resolutionDate={q.resolution_date}
                        status={q.status}
                        resolvedOptionText={q.resolved_option_text}
                      />
                    ))}
                  </div>
                </section>
              )}
              <AdSlot slot="home_bottom" />
              {closingSoon.length === 0 &&
                trending.length === 0 &&
                recent.length === 0 &&
                resolved.length === 0 && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
                    <p className="text-white/60">
                      Aún no hay preguntas. Sé el primero en{' '}
                      <Link href="/crear" className="text-white underline">
                        crear una
                      </Link>
                      .
                    </p>
                  </div>
                )}
            </div>

            {/* Barra lateral */}
            <aside className="space-y-6">
              {predictors.length > 0 && (
                <section className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-3 text-sm font-medium text-white/80">
                    🏆 Top predictores
                  </h3>
                  <div className="space-y-2">
                    {predictors.map((p) => (
                      <Link
                        key={p.user_id}
                        href={`/u/${p.user_id}`}
                        className="flex items-center justify-between text-sm transition hover:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-5 text-center text-xs text-white/40">
                            #{p.position}
                          </span>
                          <span className="text-white/70">
                            {p.display_name ?? p.username ?? 'Anónimo'}
                          </span>
                        </span>
                        <span className="text-xs text-white/40">{p.total_points} pts</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/ranking"
                    className="mt-3 block text-center text-xs text-white/40 hover:text-white"
                  >
                    Ver ranking completo →
                  </Link>
                </section>
              )}

              <section className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h3 className="mb-3 text-sm font-medium text-white/80">¿Cómo funciona?</h3>
                <ul className="space-y-2 text-xs text-white/60">
                  <li>1. Vota sin necesidad de cuenta.</li>
                  <li>2. Cuando la pregunta se resuelve, ganas puntos si aciertas.</li>
                  <li>3. Acertar lo improbable vale más que acertar lo obvio.</li>
                  <li>4. Compite en rankings por categoría y en el global.</li>
                </ul>
                <Link
                  href="/como-funciona"
                  className="mt-3 inline-block text-xs text-white/40 hover:text-white"
                >
                  Leer más →
                </Link>
              </section>

              <AdSlot slot="home_sidebar" />

              <Link
                href="/crear"
                className="block rounded-lg border border-white/10 bg-white/5 p-4 text-center text-sm transition hover:bg-white/10"
              >
                + Crear nueva pregunta
              </Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
