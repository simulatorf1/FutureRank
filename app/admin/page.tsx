'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getAnalytics } from './actions'
import {
  closeQuestion,
  reopenQuestion,
  resolveQuestion,
  updateQuestion,
  deleteQuestion,
  saveAd,
  toggleAd,
  getAdminStats,
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

type Ad = {
  id: number
  slot: string
  content: string
  link_url: string | null
  is_active: boolean
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Abierta',
  closed: 'Cerrada',
  resolved: 'Resuelta',
}

const AD_SLOTS = ['home_sidebar', 'home_bottom', 'question_sidebar', 'question_bottom']

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)

  const [view, setView] = useState<'questions' | 'ads' | 'stats' | 'traffic'>('questions')
  const [analytics, setAnalytics] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [questions, setQuestions] = useState<AdminQuestion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [message, setMessage] = useState<string | null>(null)
  const [editing, setEditing] = useState<number | null>(null)

  const [stats, setStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  const loadAll = async () => {
    const supabase = createClient()

    const [qRes, cRes, aRes] = await Promise.all([
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
      supabase
        .from('ads')
        .select('id, slot, content, link_url, is_active')
        .order('slot'),
    ])

    setQuestions(
      (qRes.data ?? []).map((q: any) => ({
        ...q,
        options: (q.question_options ?? []).sort((a: any, b: any) => a.position - b.position),
      }))
    )
    setCategories(cRes.data ?? [])
    setAds(aRes.data ?? [])
  }
  useEffect(() => {
    if (view !== 'traffic' || !authed) return
    setLoadingAnalytics(true)
    getAnalytics().then((a) => {
      setAnalytics(a)
      setLoadingAnalytics(false)
    })
  }, [view, authed])
  useEffect(() => {
    if (authed) loadAll()
  }, [authed])

  useEffect(() => {
    if (view !== 'stats' || !authed) return
    setLoadingStats(true)
    getAdminStats().then((s) => {
      setStats(s)
      setLoadingStats(false)
    })
  }, [view, authed])

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
      await loadAll()
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
        <Footer />
      </>
    )
  }

  const filtered =
    filter === 'all' ? questions : questions.filter((q) => q.status === filter)

  const findAd = (slot: string) => ads.find((a) => a.slot === slot) ?? null

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

        {/* Selector de vista */}
        <div className="mb-6 flex gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setView('questions')}
            className={`rounded-md px-3 py-1.5 text-sm ${
              view === 'questions'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white'
            }`}
          >
            Preguntas
          </button>
          <button
            onClick={() => setView('ads')}
            className={`rounded-md px-3 py-1.5 text-sm ${
              view === 'ads' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Anuncios
            
          </button>
          <button
            onClick={() => setView('traffic')}
            className={`rounded-md px-3 py-1.5 text-sm ${
              view === 'traffic' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Tráfico
          </button>          
          <button
            onClick={() => setView('stats')}
            className={`rounded-md px-3 py-1.5 text-sm ${
              view === 'stats' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Estadísticas
          </button>
        </div>

        {view === 'questions' && (
          <>
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
                <div
                  key={q.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
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

                        {(q.status === 'closed' || q.status === 'resolved') && (
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
                        )}

                        {q.status !== 'resolved' && (
                          <>
                            <span className="self-center text-xs text-white/40">
                              Resolver con:
                            </span>
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
                                  {opt.text}
                                </button>
                              </form>
                            ))}
                          </>
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
          </>
        )}

        {view === 'ads' && (
          <div className="space-y-6">
            <p className="text-sm text-white/60">
              Configura el contenido que aparece en cada hueco publicitario. Si dejas un
              slot vacío, no se muestra nada en la web.
            </p>

            {AD_SLOTS.map((slot) => {
              const current = findAd(slot)
              return (
                <div
                  key={slot}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      Slot: <span className="text-white/50">{slot}</span>
                    </h3>
                    {current && (
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          current.is_active
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {current.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    )}
                  </div>

                  <form
                    action={(fd) => {
                      fd.set('password', password)
                      fd.set('slot', slot)
                      return runAction(saveAd, fd)
                    }}
                    className="space-y-2"
                  >
                    <textarea
                      name="content"
                      defaultValue={current?.content ?? ''}
                      placeholder="Contenido (texto o HTML simple)"
                      rows={3}
                      className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                    />
                    <input
                      type="url"
                      name="linkUrl"
                      defaultValue={current?.link_url ?? ''}
                      placeholder="Enlace (opcional)"
                      className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded bg-white px-4 py-2 text-sm font-medium text-black"
                      >
                        Guardar
                      </button>
                      {current && (
                        <button
                          type="button"
                          onClick={async () => {
                            const fd = new FormData()
                            fd.set('password', password)
                            fd.set('adId', String(current.id))
                            fd.set('isActive', String(current.is_active))
                            await runAction(toggleAd, fd)
                          }}
                          className="rounded border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
                        >
                          {current.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )
            })}
          </div>
        )}

        {view === 'stats' && (
          <div className="space-y-8">
            {loadingStats || !stats ? (
              <div className="grid gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-white/5" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-4">
                  <StatCard label="Preguntas" value={stats.totals.questions} />
                  <StatCard label="Votos" value={stats.totals.votes} />
                  <StatCard label="Usuarios" value={stats.totals.users} />
                  <StatCard label="Comentarios" value={stats.totals.comments} />
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-3 text-sm font-medium text-white/80">
                    Actividad de votos
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-white/40">Hoy</div>
                      <div className="text-2xl font-semibold">{stats.votesToday}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40">Ayer</div>
                      <div className="text-2xl font-semibold text-white/60">
                        {stats.votesYesterday}
                      </div>
                      {stats.votesYesterday > 0 && (
                        <div
                          className={`mt-1 text-xs ${
                            stats.votesToday >= stats.votesYesterday
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {stats.votesToday >= stats.votesYesterday ? '▲' : '▼'}{' '}
                          {Math.abs(
                            Math.round(
                              ((stats.votesToday - stats.votesYesterday) /
                                stats.votesYesterday) *
                                100
                            )
                          )}
                          %
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-4 text-sm font-medium text-white/80">
                    Votos últimos 7 días
                  </h3>
                  <BarChart data={stats.votesByDay} />
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-4 text-sm font-medium text-white/80">
                    Usuarios nuevos últimos 7 días
                  </h3>
                  <BarChart data={stats.usersByDay} />
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-3 text-sm font-medium text-white/80">
                    Preguntas más votadas (7 días)
                  </h3>
                  <div className="space-y-2">
                    {stats.topQuestions.length === 0 ? (
                      <p className="text-xs text-white/40">Sin datos aún.</p>
                    ) : (
                      stats.topQuestions.map((q: any, i: number) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="flex items-center gap-2 text-white/70">
                            <span className="w-5 text-center text-xs text-white/40">
                              #{i + 1}
                            </span>
                            {q.title}
                          </span>
                          <span className="text-xs text-white/40">{q.count} votos</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-3 text-sm font-medium text-white/80">
                    Categorías más activas (7 días)
                  </h3>
                  <div className="space-y-2">
                    {stats.topCategories.length === 0 ? (
                      <p className="text-xs text-white/40">Sin datos aún.</p>
                    ) : (
                      stats.topCategories.map((c: any, i: number) => (
                        <div
                          key={c.name}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="flex items-center gap-2 text-white/70">
                            <span className="w-5 text-center text-xs text-white/40">
                              #{i + 1}
                            </span>
                            {c.name}
                          </span>
                          <span className="text-xs text-white/40">{c.count} votos</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {view === 'traffic' && (
          <div className="space-y-8">
            {loadingAnalytics || !analytics ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-lg bg-white/5" />
                ))}
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-4 text-sm font-medium text-white/80">
                    Visitas últimos 30 días
                  </h3>
                  <BarChart
                    data={analytics.visits.map((v: any) => ({
                      date: v.day,
                      count: Number(v.visits),
                    }))}
                  />
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-3 text-sm font-medium text-white/80">
                    Fuentes de tráfico (30 días)
                  </h3>
                  <div className="space-y-2">
                    {analytics.sources.length === 0 ? (
                      <p className="text-xs text-white/40">Sin datos aún.</p>
                    ) : (
                      analytics.sources.map((s: any) => (
                        <div
                          key={s.source}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-white/70">{s.source}</span>
                          <span className="text-xs text-white/40">
                            {s.visits} visitas
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-3 text-sm font-medium text-white/80">
                    Páginas más visitadas
                  </h3>
                  <div className="space-y-2">
                    {analytics.pages.length === 0 ? (
                      <p className="text-xs text-white/40">Sin datos aún.</p>
                    ) : (
                      analytics.pages.map((p: any, i: number) => (
                        <div
                          key={p.path}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="flex items-center gap-2 text-white/70">
                            <span className="w-5 text-center text-xs text-white/40">
                              #{i + 1}
                            </span>
                            <code className="text-xs">{p.path}</code>
                          </span>
                          <span className="text-xs text-white/40">
                            {p.visits}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-3 text-sm font-medium text-white/80">
                    Retención (30 días)
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {analytics.retention.map((r: any) => (
                      <div key={r.metric}>
                        <div className="text-xs text-white/40">{r.metric}</div>
                        <div className="text-2xl font-semibold">{r.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
      </main>
      <Footer />
    </>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )
}

function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="flex h-32 items-end justify-between gap-2">
      {data.map((d) => {
        const height = (d.count / max) * 100
        const dayLabel = new Date(d.date).toLocaleDateString('es-ES', {
          weekday: 'short',
        })
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t bg-white/30 transition-all"
                style={{ height: `${height}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                title={`${d.count} el ${d.date}`}
              />
            </div>
            <div className="text-[10px] text-white/40">{dayLabel}</div>
            <div className="text-[10px] font-medium text-white/60">{d.count}</div>
          </div>
        )
      })}
    </div>
  )
}
