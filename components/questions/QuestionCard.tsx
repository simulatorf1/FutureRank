import Link from 'next/link'

type Props = {
  id: number
  title: string
  categoryName: string
  resolutionDate: string
  status: string
}

export function QuestionCard({ id, title, categoryName, resolutionDate, status }: Props) {
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
          {status === 'resolved' ? 'Resuelta' : `Cierra ${dateStr}`}
        </span>
      </div>
      <h3 className="font-medium leading-snug">{title}</h3>
    </Link>
  )
}
