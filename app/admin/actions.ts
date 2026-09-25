'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function checkPassword(password: string) {
  return password === process.env.ADMIN_PASSWORD
}

// ---- Cerrar pregunta ----
export async function closeQuestion(formData: FormData) {
  const password = formData.get('password') as string
  const questionId = Number(formData.get('questionId'))

  if (!checkPassword(password)) return { error: 'Contraseña incorrecta' }

  const supabase = getAdminClient()
  const { error } = await supabase
    .from('questions')
    .update({ status: 'closed' })
    .eq('id', questionId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

// ---- Reabrir pregunta ----
export async function reopenQuestion(formData: FormData) {
  const password = formData.get('password') as string
  const questionId = Number(formData.get('questionId'))

  if (!checkPassword(password)) return { error: 'Contraseña incorrecta' }

  const supabase = getAdminClient()
  const { error } = await supabase
    .from('questions')
    .update({ status: 'open' })
    .eq('id', questionId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

// ---- Resolver pregunta ----
export async function resolveQuestion(formData: FormData) {
  const password = formData.get('password') as string
  const questionId = Number(formData.get('questionId'))
  const optionId = Number(formData.get('optionId'))

  if (!checkPassword(password)) return { error: 'Contraseña incorrecta' }

  const supabase = getAdminClient()
  const { error } = await supabase.rpc('resolve_question', {
    p_question_id: questionId,
    p_correct_option_id: optionId,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

// ---- Editar pregunta (título, descripción, fecha, categoría, opciones) ----
export async function updateQuestion(formData: FormData) {
  const password = formData.get('password') as string
  const questionId = Number(formData.get('questionId'))

  if (!checkPassword(password)) return { error: 'Contraseña incorrecta' }

  const supabase = getAdminClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const categoryId = Number(formData.get('categoryId'))
  const resolutionDate = formData.get('resolutionDate') as string
  const verificationSource = formData.get('verificationSource') as string

  const { error: qError } = await supabase
    .from('questions')
    .update({
      title: title.trim(),
      description: description.trim() || null,
      category_id: categoryId,
      resolution_date: new Date(resolutionDate).toISOString(),
      verification_source: verificationSource.trim() || null,
    })
    .eq('id', questionId)

  if (qError) return { error: qError.message }

  // Actualizar opciones: las que llegan con id se editan, las nuevas se insertan
  const optionIds = formData.getAll('optionId[]').map((v) => Number(v))
  const optionTexts = formData.getAll('optionText[]').map((v) => String(v))

  for (let i = 0; i < optionIds.length; i++) {
    const optId = optionIds[i]
    const text = optionTexts[i]?.trim()
    if (!optId || !text) continue

    const { error: oError } = await supabase
      .from('question_options')
      .update({ text, position: i + 1 })
      .eq('id', optId)

    if (oError) return { error: oError.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

// ---- Eliminar pregunta ----
export async function deleteQuestion(formData: FormData) {
  const password = formData.get('password') as string
  const questionId = Number(formData.get('questionId'))

  if (!checkPassword(password)) return { error: 'Contraseña incorrecta' }

  const supabase = getAdminClient()
  const { error } = await supabase.from('questions').delete().eq('id', questionId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}
