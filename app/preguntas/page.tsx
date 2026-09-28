'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { listQuestions, type QuestionListItem } from '@/lib/questions'

const TABS: { value: 'all' | 'open' | 'closed' | 'resolved'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'open', label: 'Abiertas' },
  { value: 'closed', label: 'Cerradas' },
  { value: 'resolved', label: 'Resueltas' },
]

const PAGE_SIZE = 20

function QuestionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const status = (searchParams.get('status') as 'all' | 'open' | 'closed' | 'resolved') ?? 'all'
  const page = Number(searchParams.get('page') ?? '1') || 1

  const [items, setItems] = useState<QuestionListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { items, total } = await listQuestions({ status, page, pageSize: PAGE_SIZE })
      setItems(items)
      setTotal(total)
      setLoading(false)
    }
    load()
  }, [status, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const buildUrl = (newStatus: string, newPage: number) => {
    const params = new URLSearchParams()
    if (newStatus !== 'all') params.set('status', newStatus)
    if (newPage > 1) params.set('page', String(newPage))
    const qs = params.toString()
    return `/preguntas${qs ? `?${qs}` : ''}`
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Preguntas</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={buildUrl(t.value, 1)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              status === t.value
                ? 'bg-white text-black'
                : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
          <p className="mb-3 text-sm text-white/60">
            No hay preguntas con este filtro.
          </p>
          <Link
            href="/crear"
            className="inline-block rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Crear una pregunta
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs text-white/40">
            {total} {total === 1 ? 'pregunta' : 'preguntas'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((q) => (
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

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Link
                href={buildUrl(status, Math.max(1, page - 1))}
                className={`rounded-md border border-white/10 px-3 py-1.5 text-sm ${
                  page === 1
                    ? 'pointer-events-none opacity-40'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                ← Anterior
              </Link>
              <span className="text-xs text-white/40">
                {page} / {totalPages}
              </span>
              <Link
                href={buildUrl(status, Math.min(totalPages, page + 1))}
                className={`rounded-md border border-white/10 px-3 py-1.5 text-sm ${
                  page === totalPages
                    ? 'pointer-events-none opacity-40'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                Siguiente →
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  )
}

export default function QuestionsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<main className="p-12">Cargando...</main>}>
        <QuestionsContent />
      </Suspense>
      <Footer />
    </>
  )
}
