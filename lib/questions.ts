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
      category:categories!inner(name),
      options:question_options(id, text, position)
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
    category_name: (question.category as any)?.name ?? '',
    options: (question.options as any[])?.sort((a, b) => a.position - b.position) ?? [],
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('votes')
    .select('option_id')
    .eq('question_id', questionId)
    .eq('user_id', user.id)
    .maybeSingle()

  return data?.option_id ?? null
}
