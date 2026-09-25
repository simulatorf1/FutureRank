'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function resolveQuestion(formData: FormData) {
  const password = formData.get('password') as string
  const questionId = Number(formData.get('questionId'))
  const optionId = Number(formData.get('optionId'))

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Contraseña incorrecta' }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { error } = await supabase.rpc('resolve_question', {
    p_question_id: questionId,
    p_correct_option_id: optionId,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/resolve')
  return { success: true }
}
