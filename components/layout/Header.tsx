import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Future<span className="text-white/40">Rank</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/ranking" className="text-white/60 transition hover:text-white">
            Ranking
          </Link>
          <Link
            href="/crear"
            className="rounded-md bg-white px-3 py-1.5 font-medium text-black transition hover:bg-white/90"
          >
            Crear pregunta
          </Link>
        </nav>
      </div>
    </header>
  )
}
