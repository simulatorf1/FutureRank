import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // 1. Verificar que la petición viene de Vercel Cron
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. Cliente con service_role (necesario para escribir sin RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // 3. Buscar preguntas cuya fecha ya pasó y siguen abiertas
  const { data: questions, error: selectError } = await supabase
    .from('questions')
    .select('id, title, resolution_date')
    .eq('status', 'open')
    .lte('resolution_date', new Date().toISOString())

  if (selectError) {
    console.error('Error buscando preguntas:', selectError)
    return Response.json({ error: selectError.message }, { status: 500 })
  }

  if (!questions || questions.length === 0) {
    return Response.json({ closed: 0, message: 'No hay preguntas para cerrar' })
  }

  // 4. Marcar como closed
  const ids = questions.map((q) => q.id)
  const { error: updateError } = await supabase
    .from('questions')
    .update({ status: 'closed' })
    .in('id', ids)

  if (updateError) {
    console.error('Error cerrando preguntas:', updateError)
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json({
    closed: ids.length,
    questions: questions.map((q) => ({ id: q.id, title: q.title })),
  })
}
