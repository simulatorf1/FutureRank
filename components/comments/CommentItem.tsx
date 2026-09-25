'use client'

import { useState } from 'react'
import { voteComment } from '@/lib/questions'
import { CommentForm } from './CommentForm'
import type { CommentWithScore } from '@/lib/questions'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days}d`
  const months = Math.floor(days / 30)
  return `hace ${months}mes`
}

export function CommentItem({
  comment,
  allComments,
  questionId,
  depth = 0,
  onRefresh,
}: {
  comment: CommentWithScore
  allComments: CommentWithScore[]
  questionId: number
  depth?: number
  onRefresh: () => void
}) {
  const [showReply, setShowReply] = useState(false)
  const [localVote, setLocalVote] = useState<number | null>(comment.user_vote)
  const [localScore, setLocalScore] = useState(comment.score)

  const replies = allComments
    .filter((c) => c.parent_id === comment.id)
    .sort((a, b) => b.score - a.score)

  const handleVote = async (value: 1 | -1) => {
    const newVote = localVote === value ? null : value
    const scoreDelta = (newVote ?? 0) - (localVote ?? 0)

    setLocalVote(newVote)
    setLocalScore(localScore + scoreDelta)

    try {
      if (newVote === null) {
        // No implementamos borrado de voto en el MVP; simplemente ignoramos
        return
      }
      await voteComment(comment.id, value)
    } catch (err) {
      // Revertir en caso de error
      setLocalVote(localVote)
      setLocalScore(comment.score)
    }
  }

  const maxDepth = 4
  const indent = depth < maxDepth ? depth : maxDepth

  return (
    <div style={{ marginLeft: indent * 16 }} className="border-l border-white/5 pl-4">
      <div className="py-3">
        <div className="mb-1 flex items-center gap-2 text-xs text-white/40">
          <span className="font-medium text-white/60">{comment.author_display_name}</span>
          <span>·</span>
          <span>{timeAgo(comment.created_at)}</span>
        </div>
        <p className="mb-2 whitespace-pre-wrap text-sm text-white/80">{comment.body}</p>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVote(1)}
              className={`rounded px-2 py-0.5 transition hover:bg-white/10 ${
                localVote === 1 ? 'text-orange-400' : 'text-white/40'
              }`}
            >
              ▲
            </button>
            <span className="min-w-[1.5rem] text-center font-medium text-white/60">
              {localScore}
            </span>
            <button
              onClick={() => handleVote(-1)}
              className={`rounded px-2 py-0.5 transition hover:bg-white/10 ${
                localVote === -1 ? 'text-blue-400' : 'text-white/40'
              }`}
            >
              ▼
            </button>
          </div>
          <button
            onClick={() => setShowReply((s) => !s)}
            className="text-white/40 transition hover:text-white/70"
          >
            {showReply ? 'Cancelar' : 'Responder'}
          </button>
        </div>

        {showReply && (
          <div className="mt-3">
            <CommentForm
              questionId={questionId}
              parentId={comment.id}
              placeholder="Escribe tu respuesta..."
              compact
              onCreated={() => {
                setShowReply(false)
                onRefresh()
              }}
            />
          </div>
        )}
      </div>

      {replies.length > 0 && (
        <div>
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              allComments={allComments}
              questionId={questionId}
              depth={depth + 1}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  )
}
