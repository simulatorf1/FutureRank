'use client'

import { useState, useEffect } from 'react'
import { castVote } from '@/lib/vote'
import { getVoteResults, getUserVoteForQuestion, type VoteResult } from '@/lib/questions'

type Option = { id: number; text: string; position: number }

export function VoteButtons({
  questionId,
  options,
}: {
  questionId: number
  options: Option[]
}) {
  const [userVote, setUserVote] = useState<number | null>(null)
  const [results, setResults] = useState<VoteResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [existingVote, currentResults] = await Promise.all([
          getUserVoteForQuestion(questionId),
          getVoteResults(questionId),
        ])
        setUserVote(existingVote)
        setResults(currentResults)
      } catch (e) {
        console.error('VOTEBUTTONS load error:', e)
      } finally {
        setInitialized(true)
      }
    }
    load()
  }, [questionId])



  const handleVote = async (optionId: number) => {
    console.log('HANDLE VOTE: inicio', { optionId, userVote, loading })
  
    if (userVote !== null || loading) {
      console.log('HANDLE VOTE: bloqueado por userVote o loading', { userVote, loading })
      return
    }
  
    setLoading(true)
    setError(null)
  
    try {
      console.log('HANDLE VOTE: llamando castVote')
      const result = await castVote(questionId, optionId)
      console.log('HANDLE VOTE: resultado', result)
  
      if (!result.success) {
        if (result.reason === 'already_voted') {
          const [existing, currentResults] = await Promise.all([
            getUserVoteForQuestion(questionId),
            getVoteResults(questionId),
          ])
          setUserVote(existing)
          setResults(currentResults)
        } else if (result.reason === 'closed') {
          setError('Esta pregunta ya no acepta votos.')
        }
        return
      }
  
      setUserVote(optionId)
      const updated = await getVoteResults(questionId)
      setResults(updated)
    } catch (e: any) {
      console.error('HANDLE VOTE: error', e)
      setError('No se pudo registrar el voto. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (!initialized) {
    return <div className="h-24 animate-pulse rounded-lg bg-white/5" />
  }

  const hasVoted = userVote !== null

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const result = results.find((r) => r.option_id === option.id)
        const percent = result?.percent ?? 0
        const isUserChoice = userVote === option.id

        return (
          <button
            key={option.id}
            onClick={() => handleVote(option.id)}
            disabled={hasVoted || loading}
            className={`relative w-full overflow-hidden rounded-lg border px-4 py-3 text-left transition ${
              isUserChoice
                ? 'border-white/40 bg-white/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            } ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {hasVoted && (
              <div
                className="absolute inset-y-0 left-0 bg-white/10 transition-all"
                style={{ width: `${percent}%` }}
              />
            )}
            <div className="relative flex items-center justify-between">
              <span className="font-medium">
                {option.text}
                {isUserChoice && <span className="ml-2 text-xs text-white/50">(tu voto)</span>}
              </span>
              {hasVoted && (
                <span className="text-sm text-white/60">
                  {result?.votes ?? 0} · {percent}%
                </span>
              )}
            </div>
          </button>
        )
      })}

      {!hasVoted && !loading && (
        <p className="text-xs text-white/40">
          Vota para ver los resultados. No necesitas cuenta.
        </p>
      )}

      {loading && <p className="text-xs text-white/40">Registrando voto...</p>}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
