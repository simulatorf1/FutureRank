import { createClient } from '@/lib/supabase/client'
import { ensureAnonymousSession } from './auth-anonymous'

export async function castVote(questionId: number, optionId: number) {
  const supabase = createClient()

  // 0. Verificar que la pregunta sigue abierta
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('status')
    .eq('id', questionId)
    .single()

  if (questionError || !question) {
    throw new Error('No se encontró la pregunta')
  }

  if (question.status !== 'open') {
    return { success: false, reason: 'closed', isAnonymous: false }
  }

  // 1. Asegurar sesión (anónima o registrada)
  const { session, isAnonymous } = await ensureAnonymousSession()

  if (!session) {
    throw new Error('No se pudo crear la sesión')
  }

  // 2. Insertar el voto
  const { error } = await supabase
    .from('votes')
    .insert({
      user_id: session.user.id,
      question_id: questionId,
      option_id: optionId,
    })

  if (error) {
    // Si es voto duplicado, no es un error grave: el usuario ya votó
    if (error.code === '23505') {
      return { success: false, reason: 'already_voted', isAnonymous }
    }
    throw error
  }

  return { success: true, isAnonymous }
}
