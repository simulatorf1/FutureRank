import { createClient } from '@/lib/supabase/client'

export type QuestionWithOptions = {
  id: number
  title: string
  description: string | null
  resolution_date: string
  status: string
  category_id: number
  category_name: string
  category_slug: string
  options: { id: number; text: string; position: number }[]
}

export type VoteResult = {
  option_id: number
  votes: number
  percent: number
}

export type QuestionCard = {
  id: number
  title: string
  description: string | null
  category_name: string
  category_slug: string
  resolution_date: string
  status: string
  vote_count: number
  resolved_option_text: string | null
}

export type CommentWithScore = {
  id: number
  question_id: number
  user_id: string
  parent_id: number | null
  body: string
  created_at: string
  updated_at: string
  score: number
  total_votes: number
  author_display_name: string
  user_vote: number | null
}

// ---------- PREGUNTAS ----------

export async function getQuestionBySlugOrId(id: number): Promise<QuestionWithOptions | null> {
  const supabase = createClient()

  const { data: question, error } = await supabase
    .from('questions')
    .select(`
      id, title, description, resolution_date, status, category_id,
      categories!questions_category_id_fkey(name, slug),
      question_options!question_options_question_id_fkey(id, text, position)
    `)
    .eq('id', id)
    .single()

  if (error || !question) return null

  const cats = question.categories as any
  const catObj = Array.isArray(cats) ? cats[0] : cats

  return {
    id: question.id,
    title: question.title,
    description: question.description,
    resolution_date: question.resolution_date,
    status: question.status,
    category_id: question.category_id,
    category_name: catObj?.name ?? '',
    category_slug: catObj?.slug ?? '',
    options: (question.question_options as any[])?.sort((a, b) => a.position - b.position) ?? [],
  }
}

export async function getVoteResults(questionId: number): Promise<VoteResult[]> {
  const supabase = createClient()

  const { data: rawVotes, error } = await supabase
    .from('votes')
    .select('option_id')
    .eq('question_id', questionId)

  if (error || !rawVotes) return []

  const counts = new Map<number, number>()
  for (const v of rawVotes) {
    counts.set(v.option_id, (counts.get(v.option_id) ?? 0) + 1)
  }

  const total = rawVotes.length
  if (total === 0) return []

  return Array.from(counts.entries()).map(([option_id, votes]) => ({
    option_id,
    votes,
    percent: Math.round((votes / total) * 100),
  }))
}

export async function getUserVoteForQuestion(questionId: number): Promise<number | null> {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const { data } = await supabase
    .from('votes')
    .select('option_id')
    .eq('question_id', questionId)
    .eq('user_id', session.user.id)
    .maybeSingle()

  return data?.option_id ?? null
}

// ---------- CATEGORÍAS ----------

export async function getTopCategories(): Promise<{ id: number; name: string; slug: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .is('parent_id', null)
    .order('name')

  if (error || !data) return []
  return data
}

// ---------- LISTAS DE PREGUNTAS ----------

export async function getClosingSoonQuestions(limit = 6): Promise<QuestionCard[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id, title, description, resolution_date, status,
      categories!questions_category_id_fkey(name, slug)
    `)
    .eq('status', 'open')
    .gte('resolution_date', new Date().toISOString())
    .order('resolution_date', { ascending: true })
    .limit(limit)

  if (error || !data) return []

  return data.map((q: any) => ({
    id: q.id,
    title: q.title,
    description: q.description ?? null,
    category_name: q.categories?.name ?? '',
    category_slug: q.categories?.slug ?? '',
    resolution_date: q.resolution_date,
    status: q.status,
    vote_count: 0,
    resolved_option_text: null,
  }))
}

export async function getTrendingQuestions(limit = 6): Promise<QuestionCard[]> {
  const supabase = createClient()

  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const { data: votesData } = await supabase
    .from('votes')
    .select('question_id')
    .gte('created_at', since)

  if (!votesData || votesData.length === 0) {
    return getClosingSoonQuestions(limit)
  }

  const counts = new Map<number, number>()
  for (const v of votesData) {
    counts.set(v.question_id, (counts.get(v.question_id) ?? 0) + 1)
  }

  const topIds = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id, title, description, resolution_date, status,
      categories!questions_category_id_fkey(name, slug)
    `)
    .in('id', topIds)
    .eq('status', 'open')

  if (error || !data) return []

  return data.map((q: any) => ({
    id: q.id,
    title: q.title,
    description: q.description ?? null,
    category_name: q.categories?.name ?? '',
    category_slug: q.categories?.slug ?? '',
    resolution_date: q.resolution_date,
    status: q.status,
    vote_count: counts.get(q.id) ?? 0,
    resolved_option_text: null,
  }))
}

export async function getRecentQuestions(limit = 8): Promise<QuestionCard[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id, title, description, resolution_date, status,
      categories!questions_category_id_fkey(name, slug)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map((q: any) => ({
    id: q.id,
    title: q.title,
    description: q.description ?? null,
    category_name: q.categories?.name ?? '',
    category_slug: q.categories?.slug ?? '',
    resolution_date: q.resolution_date,
    status: q.status,
    vote_count: 0,
    resolved_option_text: null,
  }))
}

export async function getRecentlyResolvedQuestions(limit = 5): Promise<QuestionCard[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id, title, description, resolution_date, status, resolved_option_id,
      categories!questions_category_id_fkey(name, slug),
      question_options!question_options_question_id_fkey(id, text)
    `)
    .eq('status', 'resolved')
    .order('resolution_date', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map((q: any) => {
    const resolvedOption = (q.question_options ?? []).find(
      (o: any) => o.id === q.resolved_option_id
    )
    return {
      id: q.id,
      title: q.title,
      description: q.description ?? null,
      category_name: q.categories?.name ?? '',
      category_slug: q.categories?.slug ?? '',
      resolution_date: q.resolution_date,
      status: q.status,
      vote_count: 0,
      resolved_option_text: resolvedOption?.text ?? null,
    }
  })
}

export async function getTopPredictors(limit = 5) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ranking_global')
    .select('user_id, display_name, username, total_points, total_correct, total_predictions, position')
    .order('position')
    .limit(limit)

  if (error || !data) return []
  return data
}

// ---------- COMENTARIOS ----------

export async function getComments(questionId: number): Promise<CommentWithScore[]> {
  const supabase = createClient()

  const { data: comments, error } = await supabase
    .from('comments_with_score')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true })

  if (error || !comments) return []

  const userIds = Array.from(new Set(comments.map((c: any) => c.user_id)))
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, username')
    .in('id', userIds)

  const { data: { session } } = await supabase.auth.getSession()
  let userVotes: Record<number, number> = {}

  if (session?.user) {
    const { data: votes } = await supabase
      .from('comment_votes')
      .select('comment_id, value')
      .eq('user_id', session.user.id)
      .in('comment_id', comments.map((c: any) => c.id))

    userVotes = Object.fromEntries((votes ?? []).map((v) => [v.comment_id, v.value]))
  }

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]))

  return comments.map((c: any) => ({
    id: c.id,
    question_id: c.question_id,
    user_id: c.user_id,
    parent_id: c.parent_id,
    body: c.body,
    created_at: c.created_at,
    updated_at: c.updated_at,
    score: c.score ?? 0,
    total_votes: c.total_votes ?? 0,
    author_display_name: profileMap.get(c.user_id)?.display_name ?? 'Anónimo',
    user_vote: userVotes[c.id] ?? null,
  }))
}

export async function createComment(
  questionId: number,
  body: string,
  parentId: number | null = null
) {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  let userId = session?.user.id

  if (!userId) {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error || !data.user) throw new Error('No se pudo crear la sesión')
    userId = data.user.id
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      question_id: questionId,
      user_id: userId,
      parent_id: parentId,
      body,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function voteComment(commentId: number, value: 1 | -1) {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  let userId = session?.user.id

  if (!userId) {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error || !data.user) throw new Error('No se pudo crear la sesión')
    userId = data.user.id
  }

  const { error } = await supabase
    .from('comment_votes')
    .upsert(
      { comment_id: commentId, user_id: userId, value },
      { onConflict: 'user_id,comment_id' }
    )

  if (error) throw error
}

export async function deleteComment(commentId: number) {
  const supabase = createClient()
  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) throw error
}

export async function deleteQuestion(questionId: number) {
  const supabase = createClient()
  const { error } = await supabase.from('questions').delete().eq('id', questionId)
  if (error) throw error
}
export async function getNextQuestion(
  currentQuestionId: number,
  excludeIds: number[] = []
): Promise<QuestionCard | null> {
  const supabase = createClient()

  // Traer la categoría de la pregunta actual
  const { data: current } = await supabase
    .from('questions')
    .select('category_id')
    .eq('id', currentQuestionId)
    .maybeSingle()

  // 1º intento: pregunta abierta de otra categoría
  let query = supabase
    .from('questions')
    .select(`
      id, title, description, resolution_date, status,
      categories!questions_category_id_fkey(name, slug)
    `)
    .eq('status', 'open')
    .neq('id', currentQuestionId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data, error } = await query

  if (error || !data || data.length === 0) return null

  // Preferir una de distinta categoría para variar el tema
  const differentCategory = current?.category_id
    ? data.find((q: any) => q.category_id !== current.category_id)
    : null

  const chosen = differentCategory ?? data[0]
  const cats = chosen.categories as any
  const catObj = Array.isArray(cats) ? cats[0] : cats

  return {
    id: chosen.id,
    title: chosen.title,
    description: chosen.description ?? null,
    category_name: catObj?.name ?? '',
    category_slug: catObj?.slug ?? '',
    resolution_date: chosen.resolution_date,
    status: chosen.status,
    vote_count: 0,
    resolved_option_text: null,
  }
}
export async function createCategory(
  name: string,
  parentId: number
): Promise<{ id: number; name: string; slug: string } | null> {
  const supabase = createClient()

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!slug) return null

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: name.trim(),
      slug,
      parent_id: parentId,
    })
    .select('id, name, slug')
    .single()

  if (error) {
    // Si el slug ya existe, devolver la categoría existente en su lugar
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', slug)
        .maybeSingle()
      return existing ?? null
    }
    throw error
  }

  return data
}
