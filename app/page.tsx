'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { CategoryBar } from '@/components/categories/CategoryBar'
import { QuestionCard } from '@/components/questions/QuestionCard'
import {
  getFeaturedQuestions,
  getTrendingQuestions,
  getRecentQuestions,
  getTopCategories,
  type QuestionCard as QuestionCardType,
} from '@/lib/questions'

export default function HomePage() {
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([])
  const [featured, setFeatured] = useState<QuestionCardType[]>([])
  const [trending, setTrending] = useState<QuestionCardType[]>([])
  const [recent, setRecent] = useState<QuestionCardType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [cats, feat, trend, rec] = await Promise.all([
        getTopCategories(),
        getFeaturedQuestions(6),
        getTrendingQuestions(6),
        getRecentQuestions(8),
      ])
      setCategories(cats)
      setFeatured(feat)
      setTrending(trend)
      setRecent(rec)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-10">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">
            ¿Tenías razón?
          </h1>
          <p className="text-white/60">
            Vota predicciones sobre el futuro y construye tu reputación acierto a acierto.
            Sin apuestas, sin dinero, solo tu historial.
          </p>
        </section>

        <CategoryBar categories={categories} />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-lg font-medium">Destacadas</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {featured.map((q) => (
                    <QuestionCard
                      key={q.id}
                      id={q.id}
                      title={q.title}
                      categoryName={q.category_name}
                      resolutionDate={q.resolution_date}
                      status={q.status}
                    />
                  ))}
                </div>
              </section>
            )}

            {trending.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-lg font-medium">Tendencias</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {trending.map((q) => (
                    <QuestionCard
                      key={q.id}
                      id={q.id}
                      title={q.title}
                      categoryName={q.category_name}
                      resolutionDate={q.resolution_date}
                      status={q.status}
                    />
                  ))}
                </div>
              </section>
            )}

            {recent.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-lg font-medium">Recientes</h2>
                <div className="space-y-3">
                  {recent.map((q) => (
                    <QuestionCard
                      key={q.id}
                      id={q.id}
                      title={q.title}
                      categoryName={q.category_name}
                      resolutionDate={q.resolution_date}
                      status={q.status}
                    />
                  ))}
                </div>
              </section>
            )}

            {featured.length === 0 && trending.length === 0 && recent.length === 0 && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-white/60">
                  Aún no hay preguntas. Sé el primero en crear una.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
