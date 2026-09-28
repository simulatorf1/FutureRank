'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'

type ProfileData = {
  id: string
  username: string | null
  display_name: string | null
  bio: string | null
  total_predictions: number
  total_correct: number
  total_points: number
  current_streak: number
  best_streak: number
}

type HistoryItem = {
  id: number
  question_id: number
  question_title: string
  points: number
  is_correct: boolean
  created_at: string
}

type Badge = {
  code: string
  name: string
  description: string
  icon: string
  category: string
  earned_at: string
}

function ProfileContent() {
  const params = useParams()
  const userId = String(params.id)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [globalPosition, setGlobalPosition] = useState<number | null>(null)
  const [categoryRanks, setCategoryRanks] = useState<any[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const load = async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    setIsOwner(user?.id === userId)

    const [profRes, histRes, rankRes, catRes, badgesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase
        .from('user_scoring_history')
        .select('*')
        .eq('user_id', userId)
        .limit(20),
      supabase
        .from('ranking_global')
        .select('position, total_points')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('user_category_stats')
        .select('*')
        .eq('user_id', userId)
        .order('position')
        .limit(10),
      supabase
        .from('user_badges')
        .select('earned_at, badges(code, name, description, icon, category)')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false }),
    ])

    setProfile(profRes.data)
    setHistory(histRes.data ?? [])
    setGlobalPosition(rankRes.data?.position ?? null)
    setCategoryRanks(catRes.data ?? [])
    setBadges(
      (badgesRes.data ?? []).map((b: any) => ({
        ...(Array.isArray(b.badges) ? b.badges[0] : b.badges),
        earned_at: b.earned_at,
      }))
    )
    setDisplayName(profRes.data?.display_name ?? '')
    setBio(profRes.data?.bio ?? '')
    setLoading(false)
  }

  useEffect(() => {
    if (userId) load()
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    setSaveMessage(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || 'Anónimo',
        bio: bio.trim() || null,
      })
      .eq('id', userId)

    if (error) {
      setSaveMessage(`Error: ${error.message}`)
    } else {
      setSaveMessage('Perfil actualizado')
      setEditing(false)
      await load()
    }
    setSaving(false)
    setTimeout(() => setSaveMessage(null), 3000)
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-white/60">Cargando perfil...</p>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-white/60">Perfil no encontrado.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-white/40 hover:text-white">
          ← Volver a la portada
        </Link>
      </main>
    )
  }

  const accuracy =
    profile.total_predictions > 0
      ? Math.round((profile.total_correct / profile.total_predictions) * 100)
      : 0

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      {saveMessage && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
          {saveMessage}
        </div>
      )}

      {editing ? (
        <div className="mb-8 space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
          <div>
            <label className="mb-1 block text-xs text-white/60">Nombre público</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              placeholder="Cómo te verán los demás"
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">
              Descripción (opcional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={280}
              placeholder="Cuéntale a los demás en qué eres bueno prediciendo..."
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-white/30">{bio.length}/280</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => {
                setEditing(false)
                setDisplayName(profile.display_name ?? '')
                setBio(profile.bio ?? '')
              }}
              className="rounded-md border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {profile.display_name ?? 'Anónimo'}
            </h1>
            {profile.username && (
              <p className="text-sm text-white/40">@{profile.username}</p>
            )}
            {profile.bio && (
              <p className="mt-3 max-w-lg text-sm text-white/60">{profile.bio}</p>
            )}
          </div>
          <div className="flex items-start gap-3">
            {isOwner && (
              <button
                onClick={() => setEditing(true)}
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/10"
              >
                Editar perfil
              </button>
            )}
            {globalPosition && (
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-right">
                <div className="text-xs text-white/40">Posición global</div>
                <div className="text-2xl font-semibold">#{globalPosition}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Predicciones" value={profile.total_predictions} />
        <Stat label="Aciertos" value={profile.total_correct} />
        <Stat label="Precisión" value={`${accuracy}%`} />
        <Stat label="Puntos" value={profile.total_points} />
      </div>

      {(profile.current_streak > 0 || profile.best_streak > 0) && (
        <div className="mb-10 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
            <div className="text-xs text-orange-300/70">🔥 Racha actual</div>
            <div className="mt-1 text-2xl font-semibold">{profile.current_streak}</div>
            <div className="text-xs text-white/40">
              {profile.current_streak === 0
                ? 'Sin racha activa'
                : profile.current_streak === 1
                ? 'acierto consecutivo'
                : 'aciertos consecutivos'}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/40">🏅 Mejor racha</div>
            <div className="mt-1 text-2xl font-semibold">{profile.best_streak}</div>
            <div className="text-xs text-white/40">récord personal</div>
          </div>
        </div>
      )}

      {badges.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-medium">
            Medallas <span className="text-white/40">({badges.length})</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {badges.map((b) => (
              <div
                key={b.code}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                title={b.description}
              >
                <span className="text-xl">{b.icon}</span>
                <div>
                  <div className="text-xs font-medium">{b.name}</div>
                  <div className="text-[10px] text-white/40">
                    {new Date(b.earned_at).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {categoryRanks.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-medium">Rankings por categoría</h2>
          <div className="space-y-2">
            {categoryRanks.map((r) => (
              <Link
                key={`${r.category_id}`}
                href={`/categoria/${r.category_slug}`}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
              >
                <span>{r.category_name}</span>
                <span className="text-white/60">
                  #{r.position} · {r.correct_predictions}/{r.resolved_predictions}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-medium">Historial reciente</h2>
          <div className="space-y-2">
            {history.map((h) => (
              <Link
                key={h.id}
                href={`/pregunta/${h.question_id}`}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:bg-white/10"
              >
                <span className="flex-1 pr-4">{h.question_title}</span>
                <span
                  className={`shrink-0 font-medium ${
                    h.is_correct ? 'text-green-400' : 'text-white/40'
                  }`}
                >
                  {h.is_correct ? `+${h.points}` : '0'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {history.length === 0 && (
        <p className="text-sm text-white/40">
          Aún no tiene predicciones resueltas.
        </p>
      )}
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <>
      <Header />
      <Suspense fallback={<main className="p-12">Cargando...</main>}>
        <ProfileContent />
      </Suspense>
      <Footer />
    </>
  )
}
export type HeadToHead = {
  me: {
    id: string
    display_name: string | null
    total_predictions: number
    total_correct: number
    total_points: number
    current_streak: number
  }
  them: {
    id: string
    display_name: string | null
    total_predictions: number
    total_correct: number
    total_points: number
    current_streak: number
  }
  sharedQuestions: {
    question_id: number
    question_title: string
    i_was_correct: boolean
    they_were_correct: boolean
    my_points: number
    their_points: number
  }[]
  score: { me: number; them: number }
}

export async function getHeadToHead(theirId: string): Promise<HeadToHead | null> {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  const myId = session.user.id

  if (myId === theirId) return null

  // Perfiles
  const [meRes, themRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', myId).maybeSingle(),
    supabase.from('profiles').select('*').eq('id', theirId).maybeSingle(),
  ])

  if (!meRes.data || !themRes.data) return null

  // Scoring events compartidos
  const [myEventsRes, theirEventsRes] = await Promise.all([
    supabase
      .from('scoring_events')
      .select('question_id, points, is_correct, questions!scoring_events_question_id_fkey(title)')
      .eq('user_id', myId),
    supabase
      .from('scoring_events')
      .select('question_id, points, is_correct')
      .eq('user_id', theirId),
  ])

  const myEvents = myEventsRes.data ?? []
  const theirEvents = theirEventsRes.data ?? []

  const theirMap = new Map(theirEvents.map((e: any) => [e.question_id, e]))

  const sharedQuestions: HeadToHead['sharedQuestions'] = []
  let scoreMe = 0
  let scoreThem = 0

  for (const mine of myEvents) {
    const theirs = theirMap.get(mine.question_id)
    if (!theirs) continue

    const iCorrect = mine.is_correct
    const theyCorrect = theirs.is_correct
    if (iCorrect && !theyCorrect) scoreMe++
    if (theyCorrect && !iCorrect) scoreThem++

    sharedQuestions.push({
      question_id: mine.question_id,
      question_title: (mine as any).questions?.title ?? '—',
      i_was_correct: iCorrect,
      they_were_correct: theyCorrect,
      my_points: mine.points,
      their_points: theirs.points,
    })
  }

  sharedQuestions.sort((a, b) => b.question_id - a.question_id)

  return {
    me: {
      id: myId,
      display_name: meRes.data.display_name,
      total_predictions: meRes.data.total_predictions,
      total_correct: meRes.data.total_correct,
      total_points: meRes.data.total_points,
      current_streak: meRes.data.current_streak,
    },
    them: {
      id: theirId,
      display_name: themRes.data.display_name,
      total_predictions: themRes.data.total_predictions,
      total_correct: themRes.data.total_correct,
      total_points: themRes.data.total_points,
      current_streak: themRes.data.current_streak,
    },
    sharedQuestions,
    score: { me: scoreMe, them: scoreThem },
  }
}
