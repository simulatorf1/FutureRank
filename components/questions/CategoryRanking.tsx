'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Row = {
  user_id: string
  display_name: string | null
  position: number
  correct_predictions: number
  resolved_predictions: number
}

export function CategoryRanking({
  categorySlug,
  categoryName,
}: {
  categorySlug: string
  categoryName: string
}) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('ranking_by_subcategory')
        .select('user_id, display_name, position, correct_predictions, resolved_predictions')
        .eq('category_slug', categorySlug)
        .order('position')
        .limit(5)

      setRows((data as Row[]) ?? [])
      setLoading(false)
    }
    if (categorySlug) load()
  }, [categorySlug])

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="h-20 animate-pulse rounded bg-white/5" />
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="mb-2 text-sm font-medium text-white/80">
          🏆 Top de {categoryName}
        </h3>
        <p className="text-xs text-white/40">
          Aún no hay predicciones resueltas en esta categoría.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-sm font-medium text-white/80">
        🏆 Top de {categoryName}
      </h3>
      <div className="space-y-2">
        {rows.map((r) => (
          <Link
            key={r.user_id}
            href={`/u/${r.user_id}`}
            className="flex items-center justify-between text-sm transition hover:text-white"
          >
            <span className="flex items-center gap-2">
              <span className="w-5 text-center text-xs text-white/40">#{r.position}</span>
              <span className="text-white/70">{r.display_name ?? 'Anónimo'}</span>
            </span>
            <span className="text-xs text-white/40">
              {r.correct_predictions}/{r.resolved_predictions}
            </span>
          </Link>
        ))}
      </div>
      <Link
        href={`/categoria/${categorySlug}`}
        className="mt-3 block text-center text-xs text-white/40 hover:text-white"
      >
        Ver toda la categoría →
      </Link>
    </div>
  )
}
