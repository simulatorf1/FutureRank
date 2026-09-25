import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-xs text-white/40">
        <div>
          FutureRank © {new Date().getFullYear()} — Sin apuestas, sin dinero, solo tu historial.
        </div>
        <div className="flex gap-4">
          <Link href="/ranking" className="hover:text-white">
            Ranking
          </Link>
          <Link href="/crear" className="hover:text-white">
            Crear pregunta
          </Link>
        </div>
      </div>
    </footer>
  )
}
