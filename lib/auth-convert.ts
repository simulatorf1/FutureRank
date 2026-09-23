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
