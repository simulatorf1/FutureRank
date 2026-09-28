'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { QuestionCard } from './QuestionCard'
import type { QuestionCard as QuestionCardType } from '@/lib/questions'

export function RelatedQuestions({
  currentId,
  categoryId,
}: {
  currentId: number
  categoryId: number
}) {
  const [questions, setQuestions] = useState<QuestionCardType[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('questions')
        .select(`
          id, title, description, resolution_date, status,
          categories!questions_category_id_fkey(name, slug)
        `)
        .eq('category_id', categoryId)
        .eq('status', 'open')
        .neq('id', currentId)
        .order('created_at', { ascending: false })
        .limit(4)

      setQuestions(
        (data ?? []).map((q: any) => ({
          id: q.id,
          title: q.title,
          description: q.description ?? null,
          category_name: q.categories?.name ?? '',
          category_slug: q.categories?.slug ?? '',
          resolution_date: q.resolution_date,
          status: q.status,
          vote_count: 0,
          resolved_option_text: null,
        }))
      )
    }
    if (currentId && categoryId) load()
  }, [currentId, categoryId])

  if (questions.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-medium">Otras preguntas de esta categoría</h2>
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
    </section>
  )
}
