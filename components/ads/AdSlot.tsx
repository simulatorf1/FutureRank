'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Ad = {
  id: number
  content: string
  link_url: string | null
}

export function AdSlot({ slot }: { slot: string }) {
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('ads')
        .select('id, content, link_url')
        .eq('slot', slot)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setAd(data ?? null)
      setLoading(false)
    }
    load()
  }, [slot])

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="h-12 animate-pulse rounded bg-white/5" />
      </div>
    )
  }

  if (!ad) return null

  const inner = (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/70">
      {ad.content}
    </div>
  )

  if (ad.link_url) {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block transition hover:opacity-80"
      >
        {inner}
      </a>
    )
  }

  return inner
}
