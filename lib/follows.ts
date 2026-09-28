import { createClient } from '@/lib/supabase/client'

export async function isFollowing(targetId: string): Promise<boolean> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return false

  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', session.user.id)
    .eq('following_id', targetId)
    .maybeSingle()

  return !!data
}

export async function followUser(targetId: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  let userId = session?.user.id
  if (!userId) {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error || !data.user) throw new Error('No se pudo crear la sesión')
    userId = data.user.id
  }

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: userId, following_id: targetId })

  if (error) throw error
}

export async function unfollowUser(targetId: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', session.user.id)
    .eq('following_id', targetId)

  if (error) throw error
}

export async function getFollowCounts(userId: string): Promise<{
  followers: number
  following: number
}> {
  const supabase = createClient()

  const [followersRes, followingRes] = await Promise.all([
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId),
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId),
  ])

  return {
    followers: followersRes.count ?? 0,
    following: followingRes.count ?? 0,
  }
}

export type FollowedPrediction = {
  id: number
  question_id: number
  question_title: string
  user_id: string
  display_name: string | null
  points: number
  is_correct: boolean
  created_at: string
}

export async function getFollowedPredictions(
  limit = 30
): Promise<FollowedPrediction[]> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return []

  const { data: followed } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', session.user.id)

  if (!followed || followed.length === 0) return []

  const ids = followed.map((f) => f.following_id)

  const { data, error } = await supabase
    .from('user_scoring_history')
    .select('*')
    .in('user_id', ids)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  // Cargar display_name de esos usuarios
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', ids)

  const nameMap = new Map((profiles ?? []).map((p: any) => [p.id, p.display_name]))

  return data.map((d: any) => ({
    id: d.id,
    question_id: d.question_id,
    question_title: d.question_title,
    user_id: d.user_id,
    display_name: nameMap.get(d.user_id) ?? null,
    points: d.points,
    is_correct: d.is_correct,
    created_at: d.created_at,
  }))
}
