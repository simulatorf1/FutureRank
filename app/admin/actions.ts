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
// ---- Crear o actualizar anuncio ----
export async function saveAd(formData: FormData) {
  const password = formData.get('password') as string
  const slot = formData.get('slot') as string
  const content = formData.get('content') as string
  const linkUrl = formData.get('linkUrl') as string

  if (!checkPassword(password)) return { error: 'Contraseña incorrecta' }

  const supabase = getAdminClient()

  const { error } = await supabase.from('ads').upsert(
    {
      slot,
      content: content.trim(),
      link_url: linkUrl.trim() || null,
      is_active: true,
    },
    { onConflict: 'slot' }
  )

  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

// ---- Desactivar anuncio ----
export async function toggleAd(formData: FormData) {
  const password = formData.get('password') as string
  const adId = Number(formData.get('adId'))
  const isActive = formData.get('isActive') === 'true'

  if (!checkPassword(password)) return { error: 'Contraseña incorrecta' }

  const supabase = getAdminClient()
  const { error } = await supabase
    .from('ads')
    .update({ is_active: !isActive, updated_at: new Date().toISOString() })
    .eq('id', adId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}
// ---- Estadísticas del panel ----
export async function getAdminStats(days: number = 30) {
  const supabase = getAdminClient()

  const now = new Date()
  const since =
    days <= 1
      ? new Date(now.getFullYear(), now.getMonth(), now().getDate()).toISOString()
      : new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const yesterdayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  ).toISOString()

  const [qTotal, vTotal, uTotal, cTotal, votesByDay, usersByDay, topQuestions, topCategories, votesToday, votesYesterday] =
    await Promise.all([
      supabase.from('questions').select('id', { count: 'exact', head: true }),
      supabase
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      supabase.from('votes').select('created_at').gte('created_at', since),
      supabase.from('profiles').select('created_at').gte('created_at', since),
      supabase
        .from('votes')
        .select('question_id, questions!votes_question_id_fkey(title)')
        .gte('created_at', since),
      supabase
        .from('votes')
        .select(`
          question_id,
          questions!votes_question_id_fkey(
            category_id,
            categories!questions_category_id_fkey(name)
          )
        `)
        .gte('created_at', since),
      supabase
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart),
      supabase
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', yesterdayStart)
        .lt('created_at', todayStart),
    ])

  const daysToShow = days > 30 ? 30 : days

  const votesByDayMap: Record<string, number> = {}
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    votesByDayMap[key] = 0
  }
  for (const v of votesByDay.data ?? []) {
    const key = v.created_at.slice(0, 10)
    if (key in votesByDayMap) votesByDayMap[key]++
  }

  const usersByDayMap: Record<string, number> = {}
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    usersByDayMap[key] = 0
  }
  for (const u of usersByDay.data ?? []) {
    const key = u.created_at.slice(0, 10)
    if (key in usersByDayMap) usersByDayMap[key]++
  }

  const qCounts: Record<number, { count: number; title: string }> = {}
  for (const v of topQuestions.data ?? []) {
    const qid = v.question_id
    const title = (v as any).questions?.title ?? '—'
    if (!qCounts[qid]) qCounts[qid] = { count: 0, title }
    qCounts[qid].count++
  }
  const topQ = Object.entries(qCounts)
    .map(([id, val]) => ({ id: Number(id), ...val }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const catCounts: Record<string, number> = {}
  for (const v of topCategories.data ?? []) {
    const name = (v as any).questions?.categories?.name ?? 'Sin categoría'
    catCounts[name] = (catCounts[name] ?? 0) + 1
  }
  const topCat = Object.entries(catCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totals: {
      questions: qTotal.count ?? 0,
      votes: vTotal.count ?? 0,
      users: uTotal.count ?? 0,
      comments: cTotal.count ?? 0,
    },
    votesByDay: Object.entries(votesByDayMap).map(([date, count]) => ({ date, count })),
    usersByDay: Object.entries(usersByDayMap).map(([date, count]) => ({ date, count })),
    topQuestions: topQ,
    topCategories: topCat,
    votesToday: votesToday.count ?? 0,
    votesYesterday: votesYesterday.count ?? 0,
  }
}
// ---- Analytics ----
export async function getAnalytics(days: number = 30) {
  const supabase = getAdminClient()

  const [visits, sources, pages, retention, cities, devices, visitors, hours] =
    await Promise.all([
      supabase.rpc('get_visits_by_day', { p_days: days }),
      supabase.rpc('get_traffic_sources', { p_days: days }),
      supabase.rpc('get_top_pages', { p_days: days, p_limit: 20 }),
      supabase.rpc('get_retention', { p_days: days }),
      supabase.rpc('get_top_cities', { p_days: days, p_limit: 10 }),
      supabase.rpc('get_device_breakdown', { p_days: days }),
      supabase.rpc('get_visitor_breakdown', { p_days: days }),
      supabase.rpc('get_visits_by_hour', { p_days: days }),
    ])

  return {
    visits: visits.data ?? [],
    sources: sources.data ?? [],
    pages: pages.data ?? [],
    retention: retention.data ?? [],
    cities: cities.data ?? [],
    devices: devices.data ?? [],
    visitors: visitors.data ?? [],
    hours: hours.data ?? [],
  }
}
