import { createClient } from '@/lib/supabase/client'

export type ImprobableHit = {
  user_id: string
  display_name: string | null
  question_id: number
  question_title: string
  points: number
  correct_votes: number
  total_votes: number
  correct_percent: number
  created_at: string
}

export async function getImprobableHits(limit = 10): Promise<ImprobableHit[]> {
  const supabase = createClient()

  // Traer todas las preguntas resueltas
  const { data: questions } = await supabase
    .from('questions')
    .select('id, title, resolved_option_id')
    .eq('status', 'resolved')

  if (!questions || questions.length === 0) return []

  const questionIds = questions.map((q) => q.id)

  // Votos de esas preguntas
  const { data: votes } = await supabase
    .from('votes')
    .select('question_id, option_id, user_id')
    .in('question_id', questionIds)

  if (!votes) return []

  // Scoring events
  const { data: scoring } = await supabase
    .from('scoring_events')
    .select('user_id, question_id, points, is_correct, created_at')
    .in('question_id', questionIds)
    .eq('is_correct', true)

  if (!scoring) return []

  // Perfiles
  const userIds = Array.from(new Set(scoring.map((s) => s.user_id)))
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds)

  const nameMap = new Map((profiles ?? []).map((p: any) => [p.id, p.display_name]))
  const questionMap = new Map(questions.map((q) => [q.id, q]))

  // Calcular % de votos a la opción correcta por pregunta
  const votesByQuestion = new Map<number, { total: number; correct: number }>()
  for (const v of votes) {
    const q = questionMap.get(v.question_id)
    if (!q) continue
    const entry = votesByQuestion.get(v.question_id) ?? { total: 0, correct: 0 }
    entry.total++
    if (v.option_id === q.resolved_option_id) entry.correct++
    votesByQuestion.set(v.question_id, entry)
  }

  // Filtrar aciertos improbables (correct_percent < 20)
  const hits: ImprobableHit[] = []
  for (const s of scoring) {
    const stats = votesByQuestion.get(s.question_id)
    const q = questionMap.get(s.question_id)
    if (!stats || !q || stats.total === 0) continue

    const percent = (stats.correct / stats.total) * 100
    if (percent >= 20) continue

    hits.push({
      user_id: s.user_id,
      display_name: nameMap.get(s.user_id) ?? null,
      question_id: s.question_id,
      question_title: q.title,
      points: s.points,
      correct_votes: stats.correct,
      total_votes: stats.total,
      correct_percent: Math.round(percent),
      created_at: s.created_at,
    })
  }

  return hits.sort((a, b) => b.points - a.points).slice(0, limit)
}

export type StreakRecord = {
  user_id: string
  display_name: string | null
  best_streak: number
  total_points: number
  total_correct: number
}

export async function getTopStreaks(limit = 10): Promise<StreakRecord[]> {
  const supabase = createClient()

  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, best_streak, total_points, total_correct')
    .gt('best_streak', 0)
    .order('best_streak', { ascending: false })
    .limit(limit)

  if (!data) return []

  return data.map((p: any) => ({
    user_id: p.id,
    display_name: p.display_name,
    best_streak: p.best_streak,
    total_points: p.total_points,
    total_correct: p.total_correct,
  }))
}

export type HardQuestion = {
  question_id: number
  question_title: string
  correct_percent: number
  total_votes: number
  correct_option_text: string
}

export async function getHardestQuestions(limit = 5): Promise<HardQuestion[]> {
  const supabase = createClient()

  const { data: questions } = await supabase
    .from('questions')
    .select(`
      id, title, resolved_option_id,
      question_options!question_options_question_id_fkey(id, text)
    `)
    .eq('status', 'resolved')

  if (!questions || questions.length === 0) return []

  const ids = questions.map((q) => q.id)
  const { data: votes } = await supabase
    .from('votes')
    .select('question_id, option_id')
    .in('question_id', ids)

  if (!votes) return []

  const stats = new Map<number, { total: number; correct: number }>()
  for (const v of votes) {
    const q = questions.find((qq) => qq.id === v.question_id)
    if (!q) continue
    const entry = stats.get(v.question_id) ?? { total: 0, correct: 0 }
    entry.total++
    if (v.option_id === q.resolved_option_id) entry.correct++
    stats.set(v.question_id, entry)
  }

  const result: HardQuestion[] = []
  for (const q of questions) {
    const s = stats.get(q.id)
    if (!s || s.total < 5) continue // mínimo 5 votos para que sea representativo
    const percent = (s.correct / s.total) * 100

    const opts = (q.question_options as any[]) ?? []
    const correctOpt = opts.find((o: any) => o.id === q.resolved_option_id)

    result.push({
      question_id: q.id,
      question_title: q.title,
      correct_percent: Math.round(percent),
      total_votes: s.total,
      correct_option_text: correctOpt?.text ?? '',
    })
  }

  return result.sort((a, b) => a.correct_percent - b.correct_percent).slice(0, limit)
}

export type TopUser = {
  user_id: string
  display_name: string | null
  total_points: number
  total_correct: number
  total_predictions: number
  position: number
  accuracy_percent: number
}

export async function getTopUsers(limit = 10): Promise<TopUser[]> {
  const supabase = createClient()

  const { data } = await supabase
    .from('ranking_global')
    .select('*')
    .order('position')
    .limit(limit)

  return (data ?? []) as TopUser[]
}
