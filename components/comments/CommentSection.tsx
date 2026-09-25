'use client'

import { useEffect, useState, useCallback } from 'react'
import { getComments, type CommentWithScore } from '@/lib/questions'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'

export function CommentSection({ questionId }: { questionId: number }) {
  const [comments, setComments] = useState<CommentWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'new' | 'top'>('top')

  const load = useCallback(async () => {
    const data = await getComments(questionId)
    setComments(data)
    setLoading(false)
  }, [questionId])

  useEffect(() => {
    load()
  }, [load])

  const rootComments = comments
    .filter((c) => c.parent_id === null)
    .sort((a, b) => (sortBy === 'top' ? b.score - a.score : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))

  return (
    <section className="mt-12 border-t border-white/10 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">
          Debate {comments.length > 0 && <span className="text-white/40">({comments.length})</span>}
        </h2>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setSortBy('top')}
            className={`rounded-md px-3 py-1 transition ${
              sortBy === 'top' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setSortBy('new')}
            className={`rounded-md px-3 py-1 transition ${
              sortBy === 'new' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Nuevos
          </button>
        </div>
      </div>

      <div className="mb-8">
        <CommentForm questionId={questionId} onCreated={load} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : rootComments.length === 0 ? (
        <p className="text-sm text-white/40">
          Aún no hay comentarios. Sé el primero en argumentar tu posición.
        </p>
      ) : (
        <div className="space-y-2">
          {rootComments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              allComments={comments}
              questionId={questionId}
              onRefresh={load}
            />
          ))}
        </div>
      )}
    </section>
  )
}
