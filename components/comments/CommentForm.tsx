'use client'

import { useState } from 'react'
import { createComment } from '@/lib/questions'

export function CommentForm({
  questionId,
  parentId = null,
  onCreated,
  placeholder = 'Añade tu argumento...',
  compact = false,
}: {
  questionId: number
  parentId?: number | null
  onCreated: () => void
  placeholder?: string
  compact?: boolean
}) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      await createComment(questionId, body.trim(), parentId)
      setBody('')
      onCreated()
    } catch (err: any) {
      setError('No se pudo publicar el comentario.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-2' : 'space-y-3'}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        maxLength={5000}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/30">{body.length}/5000</span>
        <button
          type="submit"
          disabled={!body.trim() || loading}
          className="rounded-md bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-40"
        >
          {loading ? 'Publicando...' : parentId ? 'Responder' : 'Comentar'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  )
}
