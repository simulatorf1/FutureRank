'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VoteButtons } from '@/components/questions/VoteButtons'
import { CommentSection } from '@/components/comments/CommentSection'
import { NextQuestionBlock } from '@/components/questions/NextQuestionBlock'
import {
  getQuestionBySlugOrId,
  getNextQuestion,
  type QuestionWithOptions,
  type QuestionCard,
} from '@/lib/questions'

const MAX_STEPS = 5

function QuestionContent() {
  const params = useParams()
  const router = useRouter()
  const initialId = Number(params.id)

  const [currentId, setCurrentId] = useState<number>(initialId)
  const [question, setQuestion] = useState<QuestionWithOptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [votedIds, setVotedIds] = useState<number[]>([])
  const [nextQuestion, setNextQuestion] = useState<QuestionCard | null>(null)
  const [loadingNext, setLoadingNext] = useState(false)

  // Cargar pregunta actual
  useEffect(() => {
    async function load() {
      setLoading(true)
      const q = await getQuestionBySlugOrId(currentId)
      setQuestion(q)
      setLoading(false)
    }
    if (currentId) load()
  }, [currentId])

  // Cargar siguiente pregunta cuando cambia el voto o el id
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

    // Cambiar la URL sin recargar la página (queda compartible)
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
    <main className="mx-auto max-w-2xl px-4 py-12">
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

      <div className="mb-2 text-xs uppercase tracking-wide text-white/40">
        {question.category_name}
      </div>
      <h1 className="mb-2 text-2xl font-semibold">{question.title}</h1>
      {question.description && (
        <p className="mb-6 text-sm text-white/60">{question.description}</p>
      )}

      <VoteButtons
        key={question.id}
        questionId={question.id}
        options={question.options}
        onVoted={() => {
          // Forzar recarga del siguiente bloque
          setVotedIds((prev) => [...prev])
        }}
      />

      {!loadingNext && (
        <NextQuestionBlock
          nextQuestion={nextQuestion}
          step={step + 1}
          total={MAX_STEPS}
          onNext={handleNext}
          onFinish={handleFinish}
        />
      )}

      {step === 0 && (
        <CommentSection questionId={question.id} />
      )}
    </main>
  )
}

export default function QuestionPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main className="mx-auto max-w-2xl px-4 py-12">
            <p className="text-white/60">Cargando...</p>
          </main>
        }
      >
        <QuestionContent />
      </Suspense>
      <Footer />
    </>
  )
}
