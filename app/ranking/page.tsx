'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'

type RankRow = {
  user_id: string
  username: string | null
  display_name: string | null
  total_predictions: number
  total_correct: number
  total_points: number
  accuracy_percent: number
  position: number
}

export default function RankingPage() {
  const [rows, setRows] = useState<RankRow[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCats() {
      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .is('parent_id', null)
        .order('name')
      setCategories(data ?? [])
    }
    loadCats()
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()

      const view = selectedCategory ? 'ranking_by_category' : 'ranking_global'
      let query = supabase.from(view).select('*').order('position').limit(50)

      if (selectedCategory) {
        query = query.eq('category_slug', selectedCategory)
      }

      const { data } = await query
      setRows((data as RankRow[]) ?? [])
      setLoading(false)
    }
    load()
  }, [selectedCategory])

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-6 text-2xl font-semibold">Ranking</h1>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              !selectedCategory
                ? 'bg-white text-black'
                : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Global
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                selectedCategory === cat.slug
                  ? 'bg-white text-black'
                  : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-white/40">
            Aún no hay predicciones resueltas en este ranking.
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <Link
                key={row.user_id}
                href={`/u/${row.user_id}`}
                className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:bg-white/10"
              >
                <span className="w-8 shrink-0 text-center font-semibold text-white/60">
                  #{row.position}
                </span>
                <span className="flex-1">
                  {row.display_name ?? row.username ?? 'Anónimo'}
                </span>
                <span className="shrink-0 text-white/60">
                  {row.total_correct}/{row.total_predictions} · {row.total_points} pts
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
