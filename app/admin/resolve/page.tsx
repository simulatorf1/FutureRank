'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { resolveQuestion } from './actions'

type ClosedQuestion = {
  id: number
  title: string
  resolution_date: string
  options: { id: number; text: string }[]
}

export default function AdminResolvePage() {
  const [questions, setQuestions] = useState<ClosedQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('questions')
        .select(`
          id, title, resolution_date,
          question_options(id, text)
        `)
        .eq('status', 'closed')
        .order('resolution_date')

      setQuestions(
        (data ?? []).map((q: any) => ({
          id: q.id,
          title: q.title,
          resolution_date: q.resolution_date,
          options: q.question_options ?? [],
        }))
      )
      setLoading(false)
    }
    load()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    const result = await resolveQuestion(formData)
    if (result.error) {
      setMessage(`Error: ${result.error}`)
    } else {
      setMessage('Pregunta resuelta correctamente')
      setQuestions((prev) => prev.filter((q) => q.id !== Number(formData.get('questionId'))))
    }
  }

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Resolver preguntas cerradas</h1>

      {message && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
          {message}
        </div>
      )}

      {questions.length === 0 ? (
        <p className="text-white/60">No hay preguntas cerradas pendientes de resolver.</p>
      ) : (
        <div className="space-y-6">
          {questions.map((q) => (
            <form key={q.id} action={handleSubmit} className="rounded-lg border border-white/10 p-4">
              <input type="hidden" name="questionId" value={q.id} />
              <h2 className="mb-3 font-medium">{q.title}</h2>
              <div className="mb-3 space-y-2">
                {q.options.map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 text-sm">
                    <input type="radio" name="optionId" value={opt.id} required />
                    {opt.text}
                  </label>
                ))}
              </div>
              <input
                type="password"
                name="password"
                placeholder="Contraseña de admin"
                required
                className="mb-3 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black"
              >
                Resolver con esta opción
              </button>
            </form>
          ))}
        </div>
      )}
    </main>
  )
}
