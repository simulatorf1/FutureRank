import Link from 'next/link'

type Category = { id: number; name: string; slug: string }

export function CategoryBar({ categories }: { categories: Category[] }) {
  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      <Link
        href="/"
        className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm transition hover:bg-white/10"
      >
        Todas
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/categoria/${cat.slug}`}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm transition hover:bg-white/10"
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  )
}
