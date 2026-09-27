'use client'

import Link from 'next/link'
import type { QuestionCard } from '@/lib/questions'

export function NextQuestionBlock({
  nextQuestion,
  step,
  total,
  onNext,
  onFinish,
}: {
  nextQuestion: QuestionCard | null
  step: number
  total: number
  onNext: () => void
  onFinish: () => void
}) {
  // Última pregunta del flujo
  if (step >= total) {
    return (
      <div className="mt-6 rounded-lg border border-white/20 bg-white/5 p-5">
        <p className="mb-1 text-sm font-medium">
          Has votado {total} preguntas seguidas.
        </p>
        <p className="mb-4 text-xs text-white/60">
          Crea tu propia pregunta o regístrate para guardar tu historial y competir en el ranking.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/crear"
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Crear pregunta
          </Link>
          <Link
            href="/registro"
            className="rounded-md border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Crear cuenta
          </Link>
          <button
            onClick={onFinish}
            className="rounded-md px-4 py-2 text-sm text-white/40 transition hover:text-white"
          >
            Ver ranking
          </button>
        </div>
      </div>
    )
  }

  // Sin siguiente pregunta disponible
  if (!nextQuestion) {
    return (
      <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-5 text-center">
        <p className="mb-3 text-sm text-white/60">
          No hay más preguntas disponibles por ahora.
        </p>
        <Link
          href="/crear"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Crear la siguiente pregunta
        </Link>
      </div>
    )
  }

  // Siguiente pregunta normal
  return (
    <div className="mt-6 rounded-lg border border-white/20 bg-white/5 p-5">
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-white/40">
          Llevas {step} de {total} seguidas
        </span>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-4 rounded-full ${
                i < step ? 'bg-white/60' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      <p className="mb-1 text-xs uppercase tracking-wide text-white/40">
        Siguiente — {nextQuestion.category_name}
      </p>
      <p className="mb-4 text-sm font-medium leading-snug">{nextQuestion.title}</p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onNext}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Votar esta →
        </button>
        <button
          onClick={onFinish}
          className="rounded-md px-4 py-2 text-sm text-white/40 transition hover:text-white"
        >
          Saltar y terminar
        </button>
      </div>
    </div>
  )
}
