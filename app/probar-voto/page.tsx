'use client'

import { useEffect, useState } from 'react'
import { getQuestionBySlugOrId, type QuestionWithOptions } from '@/lib/questions'
import { VoteButtons } from '@/components/questions/VoteButtons'

console.log('ENV CHECK:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
})

export default function ProbarVotoPage() {
  const questionId = 4
  const [question, setQuestion] = useState<QuestionWithOptions | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      console.log('Cargando pregunta id:', questionId)
      const q = await getQuestionBySlugOrId(questionId)
      console.log('Resultado:', q)
      setQuestion(q)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-white/60">Cargando pregunta...</p>
      </main>
    )
  }

  if (!question) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-white/60">No se encontró la pregunta. Revisa el ID.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-2 text-xs uppercase tracking-wide text-white/40">
        {question.category_name}
      </div>
      <h1 className="mb-2 text-2xl font-semibold">{question.title}</h1>
      {question.description && (
        <p className="mb-6 text-sm text-white/60">{question.description}</p>
      )}
      <VoteButtons questionId={question.id} options={question.options} />
    </main>
  )
}
