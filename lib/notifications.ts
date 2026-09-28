import { createClient } from '@/lib/supabase/client'

export type Notification = {
  id: number
  type: string
  question_id: number | null
  payload: {
    question_title?: string
    correct_option?: string
    was_correct?: boolean
    points?: number
    streak?: number
  }
  is_read: boolean
  created_at: string
}

export async function getMyNotifications(limit = 30): Promise<Notification[]> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data as Notification[]
}

export async function getUnreadCount(): Promise<number> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return 0

  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('is_read', false)

  return count ?? 0
}

export async function markAsRead(notificationId: number) {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
  if (error) throw error
}

export async function markAllAsRead() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', session.user.id)
    .eq('is_read', false)

  if (error) throw error
}
