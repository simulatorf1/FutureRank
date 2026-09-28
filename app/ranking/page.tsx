'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'

type RankRow = {
  user_id: string
  username: string | null
  display_name: string | null
  total_predictions: number
  total_correct: number
  total_points: number
  current_streak: number
  best_streak: number
  accuracy_percent: number
  position: number
}

type SeasonRankRow = {
  user_id: string
  username: string | null
  display_name: string | null
  resolved_predictions: number
  correct_predictions: number
  total_points: number
  accuracy_percent: number
  position: number
}

type Mode = 'all' | 'season'

function formatSeason(s: string) {
  const [year, q] = s.split('-')
  return `${q} ${year}`
}

export default function RankingPage() {
  const [rows, setRows] = useState<RankRow[]>([])
  const [seasonRows, setSeasonRows] = useState<SeasonRankRow[]>([])
  const [seasons, setSeasons] = useState<string[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [mode, setMode] = useState<Mode>('all')
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Cargar categorías y temporadas disponibles
  useEffect(() => {
    async function loadMeta() {
      const supabase = createClient()

      const [catsRes, seasonsRes] = await Promise.all([
        supabase
          .from('categories')
          .select('id, name, slug')
          .is('parent_id', null)
          .order('name'),
        supabase.rpc('get_available_seasons'),
      ])

      setCategories(catsRes.data ?? [])

      const list = (seasonsRes.data ?? []).map((s: any) => s.season)
      setSeasons(list)
      if (list.length > 0) setSelectedSeason(list[0])
    }
    loadMeta()
  }, [])

  // Cargar ranking según modo
  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()

      if (mode === 'season' && selectedSeason) {
        let query = supabase
          .from('ranking_by_season')
          .select('*')
          .eq('season', selectedSeason)
          .order('position')
          .limit(50)

        const { data } = await query
        setSeasonRows((data as SeasonRankRow[]) ?? [])
        setRows([])
      } else {
        const view = selectedCategory ? 'ranking_by_category' : 'ranking_global'
        let query = supabase.from(view).select('*').order('position').limit(50)

        if (selectedCategory) {
          query = query.eq('category_slug', selectedCategory)
        }

        const { data } = await query
        setRows((data as RankRow[]) ?? [])
        setSeasonRows([])
      }

      setLoading(false)
    }
    load()
  }, [mode, selectedSeason, selectedCategory])

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-6 text-2xl font-semibold">Ranking</h1>

        {/* Selector de modo */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => {
              setMode('all')
              setSelectedSeason('')
            }}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              mode === 'all'
                ? 'bg-white text-black'
                : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Histórico
          </button>
          <button
            onClick={() => setMode('season')}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              mode === 'season'
                ? 'bg-white text-black'
                : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Por temporada
          </button>
        </div>

        {/* Selector de temporada */}
        {mode === 'season' && seasons.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {seasons.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSeason(s)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  selectedSeason === s
                    ? 'bg-white text-black'
                    : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {formatSeason(s)}
              </button>
            ))}
          </div>
        )}

        {/* Selector de categoría (solo en modo histórico) */}
        {mode === 'all' && (
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
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : mode === 'season' ? (
          seasonRows.length === 0 ? (
            <p className="text-sm text-white/40">
              No hay predicciones resueltas en esta temporada.
            </p>
          ) : (
            <div className="space-y-2">
              {seasonRows.map((row) => (
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
                  <span className="shrink-0 text-right text-white/60">
                    <span className="block">
                      {row.correct_predictions}/{row.resolved_predictions} ·{' '}
                      {row.total_points} pts
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )
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
                <span className="shrink-0 text-right text-white/60">
                  <span className="block">
                    {row.total_correct}/{row.total_predictions} · {row.total_points} pts
                  </span>
                  {row.current_streak > 0 && (
                    <span className="mt-0.5 block text-xs text-orange-400">
                      🔥 {row.current_streak}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
