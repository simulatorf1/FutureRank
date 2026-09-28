'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'
import { createCategory } from '@/lib/questions'

type Category = { id: number; name: string; slug: string; parent_id: number | null }

export default function CreateQuestionPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [resolutionDate, setResolutionDate] = useState('')
  const [verificationSource, setVerificationSource] = useState('')
  const [options, setOptions] = useState<string[]>(['Sí', 'No'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Crear categoría nueva
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryParent, setNewCategoryParent] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)

  const loadCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .not('parent_id', 'is', null)
      .order('name')
    setCategories(data ?? [])
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const parentCategories = categories.filter((c) => c.parent_id === null)
  const subCategories = categories

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryParent) return
    setCreatingCategory(true)
    setError(null)

    try {
      const created = await createCategory(newCategoryName, Number(newCategoryParent))
      if (created) {
        await loadCategories()
        setCategoryId(String(created.id))
        setShowNewCategory(false)
        setNewCategoryName('')
        setNewCategoryParent('')
      } else {
        setError('No se pudo crear la categoría')
      }
    } catch (err: any) {
      setError(err.message ?? 'Error al crear la categoría')
    } finally {
      setCreatingCategory(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data: { session } } = await supabase.auth.getSession()
      let userId = session?.user.id
      if (!userId) {
        const { data, error: anonError } = await supabase.auth.signInAnonymously()
        if (anonError || !data.user) throw new Error('No se pudo crear sesión')
        userId = data.user.id
      }

      const { data: question, error: qError } = await supabase
        .from('questions')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          category_id: Number(categoryId),
          resolution_date: new Date(resolutionDate).toISOString(),
          verification_source: verificationSource.trim() || null,
          author_id: userId,
        })
        .select()
        .single()

      if (qError || !question) throw qError

      const optionsData = options
        .map((text, i) => ({ question_id: question.id, text: text.trim(), position: i + 1 }))
        .filter((o) => o.text)

      const { error: oError } = await supabase.from('question_options').insert(optionsData)
      if (oError) throw oError

      router.push(`/pregunta/${question.id}`)
    } catch (err: any) {
      setError(err.message ?? 'Error al crear la pregunta')
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-6 text-2xl font-semibold">Crear pregunta</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm text-white/60">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Ganará España el próximo Mundial?"
              required
              maxLength={200}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/60">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm text-white/60">Categoría</label>
              <button
                type="button"
                onClick={() => setShowNewCategory((v) => !v)}
                className="text-xs text-white/40 transition hover:text-white"
              >
                {showNewCategory ? 'Cancelar' : '+ Crear nueva'}
              </button>
            </div>

            {!showNewCategory ? (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
              >
                <option value="">Selecciona una categoría</option>
                {subCategories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-black">
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
                <select
                  value={newCategoryParent}
                  onChange={(e) => setNewCategoryParent(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
                >
                  <option value="">Categoría principal</option>
                  {parentCategories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-black">
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nombre de la nueva subcategoría"
                  maxLength={50}
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory || !newCategoryName.trim() || !newCategoryParent}
                  className="w-full rounded-md bg-white/10 py-2 text-sm transition hover:bg-white/20 disabled:opacity-50"
                >
                  {creatingCategory ? 'Creando...' : 'Crear y usar esta categoría'}
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/60">Fecha de resolución</label>
            <input
              type="datetime-local"
              value={resolutionDate}
              onChange={(e) => setResolutionDate(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/60">
              Fuente de verificación (opcional)
            </label>
            <input
              type="url"
              value={verificationSource}
              onChange={(e) => setVerificationSource(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">Opciones de respuesta</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...options]
                      next[i] = e.target.value
                      setOptions(next)
                    }}
                    maxLength={100}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setOptions(options.filter((_, j) => j !== i))}
                      className="rounded-lg border border-white/10 px-3 text-white/40 transition hover:bg-white/5 hover:text-white"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <button
                type="button"
                onClick={() => setOptions([...options, ''])}
                className="mt-2 text-xs text-white/40 transition hover:text-white"
              >
                + Añadir opción
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-3 font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Publicar pregunta'}
          </button>
        </form>
      </main>
      <Footer />
    </>
  )
}
