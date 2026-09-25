'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { createClient } from '@/lib/supabase/client'
import type { QuestionCard as QuestionCardType } from '@/lib/questions'

function CategoryContent() {
  const params = useParams()
  const slug = String(params.slug)
  const [questions, setQuestions] = useState<QuestionCardType[]>([])
  const [categoryName, setCategoryName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data: cat } = await supabase
        .from('categories')
        .select('id, name')
        .eq('slug', slug)
        .maybeSingle()

      if (!cat) {
        setLoading(false)
        return
      }

      setCategoryName(cat.name)

      // Buscar subcategorías de esta categoría
      const { data: subs } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', cat.id)

      const categoryIds = [cat.id, ...(subs ?? []).map((s) => s.id)]

      const { data: questions } = await supabase
        .from('questions')
        .select(`
          id, title, resolution_date, status,
          categories!questions_category_id_fkey(name, slug)
        `)
        .in('category_id', categoryIds)
        .order('created_at', { ascending: false })
        .limit(50)

      setQuestions(
        (questions ?? []).map((q: any) => ({
          id: q.id,
          title: q.title,
          category_name: q.categories?.name ?? '',
          category_slug: q.categories?.slug ?? '',
          resolution_date: q.resolution_date,
          status: q.status,
          vote_count: 0,
          option_count: 0,
        }))
      )
      setLoading(false)
    }
    if (slug) load()
  }, [slug])

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">{categoryName || 'Categoría'}</h1>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <p className="text-sm text-white/40">No hay preguntas en esta categoría todavía.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {questions.map((q) => (
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
      )}
    </main>
  )
}

export default function CategoryPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<main className="p-12">Cargando...</main>}>
        <CategoryContent />
      </Suspense>
    </>
  )
}
