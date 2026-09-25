'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { VoteButtons } from '@/components/questions/VoteButtons'
import { getQuestionBySlugOrId, type QuestionWithOptions } from '@/lib/questions'

export default function QuestionPage() {
  const params = useParams()
  const id = Number(params.id)
  const [question, setQuestion] = useState<QuestionWithOptions | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const q = await getQuestionBySlugOrId(id)
      setQuestion(q)
      setLoading(false)
    }
    if (id) load()
  }, [id])

  if (loading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <p className="text-white/60">Cargando...</p>
        </main>
      </>
    )
  }

  if (!question) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <p className="text-white/60">No se encontró la pregunta.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-white/40 hover:text-white">
            ← Volver a la portada
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
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
    </>
  )
}
