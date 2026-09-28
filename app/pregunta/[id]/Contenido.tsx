'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VoteButtons } from '@/components/questions/VoteButtons'
import { CommentSection } from '@/components/comments/CommentSection'
import { NextQuestionBlock } from '@/components/questions/NextQuestionBlock'
import { ShareButtons } from '@/components/questions/ShareButtons'
import { CategoryRanking } from '@/components/questions/CategoryRanking'
import { AdSlot } from '@/components/ads/AdSlot'
import { RelatedQuestions } from '@/components/questions/RelatedQuestions'
import {
  getQuestionBySlugOrId,
  getNextQuestion,
  type QuestionWithOptions,
  type QuestionCard,
} from '@/lib/questions'
import { createClient } from '@/lib/supabase/client'

const MAX_STEPS = 5

function QuestionContent() {
  const params = useParams()
  const router = useRouter()
  const initialId = Number(params.id)

  const [currentId, setCurrentId] = useState<number>(initialId)
  const [question, setQuestion] = useState<QuestionWithOptions | null>(null)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [votedIds, setVotedIds] = useState<number[]>([])
  const [nextQuestion, setNextQuestion] = useState<QuestionCard | null>(null)
  const [loadingNext, setLoadingNext] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const q = await getQuestionBySlugOrId(currentId)
      setQuestion(q)
      setLoading(false)

      if (q) {
        const supabase = createClient()
        const { data } = await supabase
          .from('questions')
          .select('category_id')
          .eq('id', q.id)
          .single()
        setCategoryId(data?.category_id ?? null)
      }
    }
    if (currentId) load()
  }, [currentId])

  useEffect(() => {
    if (!question || loading) return

    async function loadNext() {
      setLoadingNext(true)
      const next = await getNextQuestion(currentId, [currentId, ...votedIds])
      setNextQuestion(next)
      setLoadingNext(false)
    }
    loadNext()
  }, [question, currentId, votedIds, loading])

  const handleNext = useCallback(() => {
    if (!nextQuestion) return
    setVotedIds((prev) => [...prev, currentId])
    setStep((prev) => prev + 1)
    setCurrentId(nextQuestion.id)
    window.history.replaceState(null, '', `/pregunta/${nextQuestion.id}`)
  }, [nextQuestion, currentId])

  const handleFinish = useCallback(() => {
    router.push('/ranking')
  }, [router])

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-white/60">Cargando...</p>
      </main>
    )
  }

  if (!question) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-white/60">No se encontró la pregunta.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-white/40 hover:text-white">
          ← Volver a la portada
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      {step > 0 && (
        <div className="mb-6 flex items-center justify-between text-xs">
          <span className="text-white/40">
            Predicción {step + 1} de {MAX_STEPS}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: MAX_STEPS }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-4 rounded-full ${
                  i < step ? 'bg-white/60' : i === step ? 'bg-white/30' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-2 text-xs uppercase tracking-wide text-white/40">
            {question.category_name}
          </div>
          <h1 className="mb-2 text-2xl font-semibold">{question.title}</h1>
          {question.description && (
            <p className="mb-4 text-sm text-white/60">{question.description}</p>
          )}

          <ShareButtons title={question.title} />

          <div className="mt-6">
            <VoteButtons
              key={question.id}
              questionId={question.id}
              options={question.options}
              onVoted={() => {
                setVotedIds((prev) => [...prev])
              }}
            />
          </div>

          {!loadingNext && (
            <NextQuestionBlock
              nextQuestion={nextQuestion}
              step={step + 1}
              total={MAX_STEPS}
              onNext={handleNext}
              onFinish={handleFinish}
            />
          )}

          <div className="mt-8">
            <AdSlot slot="question_bottom" />
          </div>

          {categoryId && (
            <RelatedQuestions currentId={question.id} categoryId={categoryId} />
          )}

          {step === 0 && <CommentSection questionId={question.id} />}
        </div>

        <aside className="space-y-6">
          {question.category_slug && (
            <CategoryRanking
              categorySlug={question.category_slug}
              categoryName={question.category_name}
            />
          )}
          <AdSlot slot="question_sidebar" />
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-medium text-white/80">¿Cómo se puntúa?</h3>
            <p className="text-xs text-white/60">
              Acertar lo que muy pocos votaron vale muchos más puntos que acertar lo obvio.
              Fallar no resta.
            </p>
            <Link
              href="/como-funciona"
              className="mt-3 inline-block text-xs text-white/40 hover:text-white"
            >
              Ver detalles →
            </Link>
          </div>

          <Link
            href="/crear"
            className="block rounded-lg border border-white/10 bg-white/5 p-4 text-center text-sm transition hover:bg-white/10"
          >
            + Crear nueva pregunta
          </Link>
        </aside>
      </div>
    </main>
  )
}

export default function Contenido() {
  return <QuestionContent />
}
