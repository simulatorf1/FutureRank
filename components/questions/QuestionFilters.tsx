'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Category = { id: number; name: string; slug: string; parent_id: number | null }

export type Filters = {
  search: string
  categorySlug: string
  subcategorySlug: string
  sort: 'recent' | 'oldest' | 'closing' | 'alpha'
}

export function QuestionFilters({
  filters,
  onChange,
}: {
  filters: Filters
  onChange: (next: Filters) => void
}) {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchInput, setSearchInput] = useState(filters.search)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .order('name')
      setCategories(data ?? [])
    }
    load()
  }, [])

  const parents = categories.filter((c) => c.parent_id === null)
  const subcategories = filters.categorySlug
    ? categories.filter(
        (c) => c.parent_id === parents.find((p) => p.slug === filters.categorySlug)?.id
      )
    : []

  return (
    <div className="mb-6 space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
      {/* Búsqueda */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onChange({ ...filters, search: searchInput })
          }}
          placeholder="Buscar preguntas..."
          className="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
        />
        <button
          onClick={() => onChange({ ...filters, search: searchInput })}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Buscar
        </button>
        {filters.search && (
          <button
            onClick={() => {
              setSearchInput('')
              onChange({ ...filters, search: '' })
            }}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:bg-white/10"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Filtros en fila */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-white/40">Categoría</label>
          <select
            value={filters.categorySlug}
            onChange={(e) =>
              onChange({
                ...filters,
                categorySlug: e.target.value,
                subcategorySlug: '',
              })
            }
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
          >
            <option value="">Todas</option>
            {parents.map((c) => (
              <option key={c.id} value={c.slug} className="bg-black">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/40">Subcategoría</label>
          <select
            value={filters.subcategorySlug}
            onChange={(e) => onChange({ ...filters, subcategorySlug: e.target.value })}
            disabled={!filters.categorySlug || subcategories.length === 0}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none disabled:opacity-40"
          >
            <option value="">Todas</option>
            {subcategories.map((c) => (
              <option key={c.id} value={c.slug} className="bg-black">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/40">Ordenar por</label>
          <select
            value={filters.sort}
            onChange={(e) =>
              onChange({ ...filters, sort: e.target.value as Filters['sort'] })
            }
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
          >
            <option value="recent" className="bg-black">Más recientes</option>
            <option value="oldest" className="bg-black">Más antiguas</option>
            <option value="closing" className="bg-black">Próximas a cerrar</option>
            <option value="alpha" className="bg-black">Alfabético (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
