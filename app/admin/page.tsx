'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import {
  closeQuestion,
  reopenQuestion,
  resolveQuestion,
  updateQuestion,
  deleteQuestion,
} from './actions'

type AdminQuestion = {
  id: number
  title: string
  description: string | null
  category_id: number
  resolution_date: string
  status: string
  verification_source: string | null
  resolved_option_id: number | null
  options: { id: number; text: string; position: number }[]
}

type Category = { id: number; name: string; slug: string }

const STATUS_LABEL: Record<string, string> = {
  open: 'Abierta',
  closed: 'Cerrada',
  resolved: 'Resuelta',
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [questions, setQuestions] = useState<AdminQuestion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [message, setMessage] = useState<string | null>(null)
  const [editing, setEditing] = useState<number | null>(null)

  const load = async () => {
    const supabase = createClient()
    const [qRes, cRes] = await Promise.all([
      supabase
        .from('questions')
        .select(`
          id, title, description, category_id, resolution_date, status,
          verification_source, resolved_option_id,
          question_options!question_options_question_id_fkey(id, text, position)
        `)
        .order('id', { ascending: false }),
      supabase
        .from('categories')
        .select('id, name, slug')
        .not('parent_id', 'is', null)
        .order('name'),
    ])

    setQuestions(
      (qRes.data ?? []).map((q: any) => ({
        ...q,
        options: (q.question_options ?? []).sort((a: any, b: any) => a.position - b.position),
      }))
    )
    setCategories(cRes.data ?? [])
  }

  useEffect(() => {
    if (authed) load()
  }, [authed])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthed(true)
  }

  const runAction = async (
    action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>,
    formData: FormData
  ) => {
    const result = await action(formData)
    if (result.error) {
      setMessage(`Error: ${result.error}`)
    } else {
      setMessage('Acción completada')
      await load()
    }
    setTimeout(() => setMessage(null), 3000)
  }

  if (!authed) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-md px-4 py-16">
          <h1 className="mb-6 text-2xl font-semibold">Acceso admin</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-white py-2.5 font-medium text-black"
            >
              Entrar
            </button>
          </form>
        </main>
      </>
    )
  }

  const filtered =
    filter === 'all' ? questions : questions.filter((q) => q.status === filter)

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold">Panel de administración</h1>

        {message && (
          <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
            {message}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'open', 'closed', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                filter === f
                  ? 'bg-white text-black'
                  : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'Todas' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((q) => (
            <div key={q.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2 text-xs">
                    <span className="rounded bg-white/10 px-2 py-0.5">
                      {STATUS_LABEL[q.status]}
                    </span>
                    <span className="text-white/40">id {q.id}</span>
                  </div>
                  <h3 className="font-medium">{q.title}</h3>
                  <p className="mt-1 text-xs text-white/40">
                    Cierra el {new Date(q.resolution_date).toLocaleString('es-ES')}
                  </p>
                </div>
                <button
                  onClick={() => setEditing(editing === q.id ? null : q.id)}
                  className="rounded border border-white/10 px-3 py-1 text-xs text-white/60 hover:bg-white/10"
                >
                  {editing === q.id ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {editing === q.id ? (
                <form
                  action={(fd) => {
                    fd.set('password', password)
                    fd.set('questionId', String(q.id))
                    return runAction(updateQuestion, fd)
                  }}
                  className="space-y-3 border-t border-white/10 pt-3"
                >
                  <input
                    name="title"
                    defaultValue={q.title}
                    required
                    className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 text-sm"
                  />
                  <textarea
                    name="description"
                    defaultValue={q.description ?? ''}
                    rows={2}
                    className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 text-sm"
                  />
                  <select
                    name="categoryId"
                    defaultValue={q.category_id}
                    className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-black">
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="datetime-local"
                    name="resolutionDate"
                    defaultValue={q.resolution_date.slice(0, 16)}
                    required
                    className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 text-sm"
                  />
                  <input
                    name="verificationSource"
                    defaultValue={q.verification_source ?? ''}
                    placeholder="Fuente de verificación"
                    className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 text-sm"
                  />
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <div key={opt.id} className="flex gap-2">
                        <input type="hidden" name="optionId[]" value={opt.id} />
                        <input
                          name="optionText[]"
                          defaultValue={opt.text}
                          className="flex-1 rounded border border-white/10 bg-black/20 px-3 py-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="rounded bg-white px-4 py-2 text-sm font-medium text-black"
                  >
                    Guardar cambios
                  </button>
                </form>
              ) : (
                <>
                  <div className="mb-3 space-y-1 text-sm">
                    {q.options.map((opt) => (
                      <div key={opt.id} className="text-white/60">
                        • {opt.text}
                        {q.resolved_option_id === opt.id && (
                          <span className="ml-2 text-green-400">✓ correcta</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-white/10 pt-3">
                    {q.status === 'open' && (
                      <form
                        action={(fd) => {
                          fd.set('password', password)
                          fd.set('questionId', String(q.id))
                          return runAction(closeQuestion, fd)
                        }}
                      >
                        <button className="rounded border border-white/10 px-3 py-1 text-xs hover:bg-white/10">
                          Cerrar
                        </button>
                      </form>
                    )}

                    {q.status === 'closed' && (
                      <>
                        <form
                          action={(fd) => {
                            fd.set('password', password)
                            fd.set('questionId', String(q.id))
                            return runAction(reopenQuestion, fd)
                          }}
                        >
                          <button className="rounded border border-white/10 px-3 py-1 text-xs hover:bg-white/10">
                            Reabrir
                          </button>
                        </form>

                        {q.options.map((opt) => (
                          <form
                            key={opt.id}
                            action={(fd) => {
                              fd.set('password', password)
                              fd.set('questionId', String(q.id))
                              fd.set('optionId', String(opt.id))
                              return runAction(resolveQuestion, fd)
                            }}
                          >
                            <button className="rounded bg-green-500/20 px-3 py-1 text-xs text-green-300 hover:bg-green-500/30">
                              Resolver: {opt.text}
                            </button>
                          </form>
                        ))}
                      </>
                    )}

                    {q.status === 'resolved' && (
                      <form
                        action={(fd) => {
                          fd.set('password', password)
                          fd.set('questionId', String(q.id))
                          return runAction(reopenQuestion, fd)
                        }}
                      >
                        <button className="rounded border border-white/10 px-3 py-1 text-xs hover:bg-white/10">
                          Reabrir (recalcular)
                        </button>
                      </form>
                    )}

                    <form
                      action={(fd) => {
                        if (!confirm('¿Eliminar esta pregunta definitivamente?')) return
                        fd.set('password', password)
                        fd.set('questionId', String(q.id))
                        return runAction(deleteQuestion, fd)
                      }}
                    >
                      <button className="rounded border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-sm text-white/40">No hay preguntas con este filtro.</p>
          )}
        </div>
      </main>
    </>
  )
}
