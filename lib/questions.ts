import { createClient } from '@/lib/supabase/client'

export type QuestionWithOptions = {
  id: number
  title: string
  description: string | null
  resolution_date: string
  status: string
  category_name: string
  options: { id: number; text: string; position: number }[]
}

export async function getQuestionBySlugOrId(id: number): Promise<QuestionWithOptions | null> {
  const supabase = createClient()

  const { data: question, error } = await supabase
    .from('questions')
    .select(`
      id, title, description, resolution_date, status,
      categories!questions_category_id_fkey(name),
      question_options!question_options_question_id_fkey(id, text, position)
    `)
    .eq('id', id)
    .single()

  if (error || !question) return null

  return {
    id: question.id,
    title: question.title,
    description: question.description,
    resolution_date: question.resolution_date,
    status: question.status,
    category_name: (question.categories as any)?.name ?? '',
    options: (question.question_options as any[])?.sort((a, b) => a.position - b.position) ?? [],
  }
}

export type VoteResult = {
  option_id: number
  votes: number
  percent: number
}

export async function getVoteResults(questionId: number): Promise<VoteResult[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('votes')
    .select('option_id')

  // Filtramos manualmente porque Supabase no permite agrupar directamente sin RPC
  const filtered = (data ?? []).filter(() => true)

  const { data: rawVotes } = await supabase
    .from('votes')
    .select('option_id, question_id')
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
export type QuestionCard = {
  id: number
  title: string
  category_name: string
  category_slug: string
  resolution_date: string
  status: string
  vote_count: number
  option_count: number
}

export async function getFeaturedQuestions(limit = 6): Promise<QuestionCard[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id, title, resolution_date, status,
      categories!questions_category_id_fkey(name, slug),
      question_options!question_options_question_id_fkey(id)
    `)
    .eq('status', 'open')
    .order('resolution_date', { ascending: true })
    .limit(limit)

  if (error || !data) return []

  return data.map((q: any) => ({
    id: q.id,
    title: q.title,
    category_name: q.categories?.name ?? '',
    category_slug: q.categories?.slug ?? '',
    resolution_date: q.resolution_date,
    status: q.status,
    vote_count: 0,
    option_count: q.question_options?.length ?? 0,
  }))
}

export async function getTrendingQuestions(limit = 6): Promise<QuestionCard[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id, title, resolution_date, status,
      categories!questions_category_id_fkey(name, slug),
      question_options!question_options_question_id_fkey(id)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map((q: any) => ({
    id: q.id,
    title: q.title,
    category_name: q.categories?.name ?? '',
    category_slug: q.categories?.slug ?? '',
    resolution_date: q.resolution_date,
    status: q.status,
    vote_count: 0,
    option_count: q.question_options?.length ?? 0,
  }))
}

export async function getRecentQuestions(limit = 8): Promise<QuestionCard[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id, title, resolution_date, status,
      categories!questions_category_id_fkey(name, slug),
      question_options!question_options_question_id_fkey(id)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map((q: any) => ({
    id: q.id,
    title: q.title,
    category_name: q.categories?.name ?? '',
    category_slug: q.categories?.slug ?? '',
    resolution_date: q.resolution_date,
    status: q.status,
    vote_count: 0,
    option_count: q.question_options?.length ?? 0,
  }))
}

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
