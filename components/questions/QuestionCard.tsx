import Link from 'next/link'

type Props = {
  id: number
  title: string
  categoryName: string
  resolutionDate: string
  status: string
  resolvedOptionText?: string | null
}

function timeUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return 'vencida'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 0) return `en ${days}d`
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours > 0) return `en ${hours}h`
  const mins = Math.floor(diff / (1000 * 60))
  return `en ${mins}m`
}

export function QuestionCard({
  id,
  title,
  categoryName,
  resolutionDate,
  status,
  resolvedOptionText,
}: Props) {
  const date = new Date(resolutionDate)
  const dateStr = date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Link
      href={`/pregunta/${id}`}
      className="block rounded-lg border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
    >
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="uppercase tracking-wide text-white/40">{categoryName}</span>
        <span className="text-white/40">
          {status === 'resolved'
            ? 'Resuelta'
            : status === 'closed'
            ? 'Cerrada'
            : `Cierra ${timeUntil(resolutionDate)}`}
        </span>
      </div>
      <h3 className="font-medium leading-snug">{title}</h3>
      {status === 'resolved' && resolvedOptionText && (
        <div className="mt-2 text-xs text-green-400">✓ {resolvedOptionText}</div>
      )}
      {status === 'open' && (
        <div className="mt-2 text-xs text-white/30">Cierra el {dateStr}</div>
      )}
    </Link>
  )
}
