import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, referrer, userId, isAnonymous } = body

    if (!path || typeof path !== 'string') {
      return Response.json({ ok: false }, { status: 400 })
    }

    // IP del visitante
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null

    // Detectar dispositivo por user-agent
    const ua = request.headers.get('user-agent') ?? ''
    const device = /mobile|android|iphone|ipad/i.test(ua)
      ? 'móvil'
      : /tablet|ipad/i.test(ua)
      ? 'tablet'
      : 'escritorio'

    // Geolocalización por IP (gratis, sin API key)
    let city: string | null = null
    let country: string | null = null

    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country`, {
          signal: AbortSignal.timeout(2000),
        })
        const geo = await geoRes.json()
        if (geo.status === 'success') {
          city = geo.city ?? null
          country = geo.country ?? null
        }
      } catch {
        // Si falla la geolocalización, seguimos sin ella
      }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.from('page_views').insert({
      path: path.slice(0, 500),
      referrer: referrer ? String(referrer).slice(0, 500) : null,
      user_agent: ua.slice(0, 300),
      user_id: userId ?? null,
      city,
      country,
      device,
      is_anonymous: isAnonymous ?? true,
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}
