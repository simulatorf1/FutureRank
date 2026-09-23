import { createClient } from '@/lib/supabase/client'

export async function convertAnonymousToPermanent(email: string) {
  const supabase = createClient()

  // 1. Verificar que el usuario actual es anónimo
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No hay sesión activa')
  }
  
  if (!user.is_anonymous) {
    throw new Error('El usuario ya es permanente')
  }

  // 2. Vincular email al usuario anónimo (conserva el mismo ID)
  const { data, error } = await supabase.auth.updateUser({ email })

  if (error) {
    throw error
  }

  // 3. Tras verificar el email, el usuario podrá establecer contraseña
  // con otro updateUser({ password: '...' })
  return data
}

export async function convertOrLinkToExisting(email: string, password?: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.is_anonymous) {
    throw new Error('No es un usuario anónimo')
  }

  // Intento 1: vincular el email al usuario anónimo actual
  const { error: updateError } = await supabase.auth.updateUser({ email })

  if (!updateError) {
    return { action: 'converted' as const }
  }

  // Si el email ya existe, intentar iniciar sesión en esa cuenta
  if (updateError.message.includes('already been registered') && password) {
    const { data: signInData, error: signInError } = 
      await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      throw new Error('El email ya está registrado. Inicia sesión con tu contraseña.')
    }

    // Reasignar los votos del usuario anónimo al usuario existente
    const anonId = user.id
    const existingId = signInData.user.id

    await supabase
      .from('votes')
      .update({ user_id: existingId })
      .eq('user_id', anonId)

    await supabase
      .from('comments')
      .update({ user_id: existingId })
      .eq('user_id', anonId)

    return { action: 'linked' as const }
  }

  throw updateError
}
