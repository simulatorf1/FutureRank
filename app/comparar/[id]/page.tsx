'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getHeadToHead, type HeadToHead } from '@/lib/questions'

function CompareContent() {
  const params = useParams()
  const theirId = String(params.id)
  const [data, setData] = useState<HeadToHead | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsLogin, setNeedsLogin] = useState(false)

  useEffect(() => {
    async function load() {
      const result = await getHeadToHead(theirId)
      if (!result) setNeedsLogin(true)
      else setData(result)
      setLoading(false)
    }
    if (theirId) load()
  }, [theirId])

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-white/60">Cargando comparación...</p>
      </main>
    )
  }

  if (needsLogin) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="mb-3 text-2xl font-semibold">Necesitas votar primero</h1>
        <p className="mb-6 text-sm text-white/60">
          Para comparar tu historial con otro usuario, primero debes tener predicciones
          resueltas. Vota algunas preguntas y vuelve.
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-white px-6 py-2.5 font-medium text-black transition hover:bg-white/90"
        >
          Ver preguntas
        </Link>
      </main>
    )
  }

  if (!data) return null

  const myAccuracy =
    data.me.total_predictions > 0
      ? Math.round((data.me.total_correct / data.me.total_predictions) * 100)
      : 0
  const theirAccuracy =
    data.them.total_predictions > 0
      ? Math.round((data.them.total_correct / data.them.total_predictions) * 100)
      : 0

  const amILeading = data.score.me > data.score.them
  const areWeTied = data.score.me === data.score.them

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-center text-2xl font-semibold">Comparación</h1>

      {/* Marcador */}
      <div className="mb-10 rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="grid grid-cols-3 items-center gap-4">
          <div className="text-center">
            <div className="text-xs text-white/40">Tú</div>
            <div className="mt-1 text-3xl font-semibold">
              {data.score.me}
            </div>
            <div className="mt-1 text-xs text-white/60">
              {data.me.display_name ?? 'Anónimo'}
            </div>
          </div>
          <div className="text-center text-xs text-white/40">
            {areWeTied ? 'Empate' : amILeading ? 'Vas ganando' : 'Van ganando'}
          </div>
          <div className="text-center">
            <div className="text-xs text-white/40">Rival</div>
            <div className="mt-1 text-3xl font-semibold">
              {data.score.them}
            </div>
            <div className="mt-1 text-xs text-white/60">
              {data.them.display_name ?? 'Anónimo'}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mb-10 grid gap-3 sm:grid-cols-3">
        <CompareRow
          label="Precisión"
          me={`${myAccuracy}%`}
          them={`${theirAccuracy}%`}
          meWins={myAccuracy > theirAccuracy}
          tie={myAccuracy === theirAccuracy}
        />
        <CompareRow
          label="Puntos"
          me={data.me.total_points}
          them={data.them.total_points}
          meWins={data.me.total_points > data.them.total_points}
          tie={data.me.total_points === data.them.total_points}
        />
        <CompareRow
          label="Racha actual"
          me={data.me.current_streak}
          them={data.them.current_streak}
          meWins={data.me.current_streak > data.them.current_streak}
          tie={data.me.current_streak === data.them.current_streak}
        />
      </div>

      {/* Enfrentamientos */}
      <section>
        <h2 className="mb-4 text-lg font-medium">
          Enfrentamientos directos{' '}
          <span className="text-white/40">({data.sharedQuestions.length})</span>
        </h2>

        {data.sharedQuestions.length === 0 ? (
          <p className="text-sm text-white/40">
            No habéis votado ninguna pregunta en común todavía.
          </p>
        ) : (
          <div className="space-y-2">
            {data.sharedQuestions.map((q) => (
              <Link
                key={q.question_id}
                href={`/pregunta/${q.question_id}`}
                className="block rounded-lg border border-white/10 bg-white/5 p-4 text-sm transition hover:bg-white/10"
              >
                <div className="mb-2 font-medium">{q.question_title}</div>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={
                      q.i_was_correct ? 'text-green-400' : 'text-white/40'
                    }
                  >
                    Tú: {q.i_was_correct ? `✅ +${q.my_points}` : '❌'}
                  </span>
                  <span
                    className={
                      q.they_were_correct ? 'text-green-400' : 'text-white/40'
                    }
                  >
                    Rival: {q.they_were_correct ? `✅ +${q.their_points}` : '❌'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mt-10 flex justify-center gap-3">
        <Link
          href={`/u/${data.them.id}`}
          className="rounded-md border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10"
        >
          Ver su perfil
        </Link>
        <Link
          href="/ranking"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Ver ranking completo
        </Link>
      </div>
    </main>
  )
}

function CompareRow({
  label,
  me,
  them,
  meWins,
  tie,
}: {
  label: string
  me: string | number
  them: string | number
  meWins: boolean
  tie: boolean
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-2 text-xs text-white/40">{label}</div>
      <div className="flex items-center justify-between text-sm">
        <span className={tie ? 'text-white/60' : meWins ? 'text-green-400' : 'text-white/40'}>
          {me}
        </span>
        <span className="text-white/20">vs</span>
        <span className={tie ? 'text-white/60' : !meWins ? 'text-green-400' : 'text-white/40'}>
          {them}
        </span>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <>
      <Header />
      <Suspense fallback={<main className="p-12">Cargando...</main>}>
        <CompareContent />
      </Suspense>
      <Footer />
    </>
  )
}
