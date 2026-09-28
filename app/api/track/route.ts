import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, referrer, userId } = body

    if (!path || typeof path !== 'string') {
      return Response.json({ ok: false }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.from('page_views').insert({
      path: path.slice(0, 500),
      referrer: referrer ? String(referrer).slice(0, 500) : null,
      user_agent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
      user_id: userId ?? null,
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}
