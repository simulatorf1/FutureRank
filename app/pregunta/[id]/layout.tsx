import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: q } = await supabase
    .from('questions')
    .select('title, description')
    .eq('id', Number(id))
    .maybeSingle()

  if (!q) return { title: 'FutureRank' }

  return {
    title: `${q.title} — FutureRank`,
    description: q.description ?? 'Vota y demuestra quién predice mejor el futuro.',
    openGraph: {
      title: q.title,
      description: q.description ?? 'Vota y demuestra quién predice mejor el futuro.',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: q.title,
      description: q.description ?? 'Vota y demuestra quién predice mejor el futuro.',
    },
  }
}

export default function QuestionLayout({ children }: { children: React.ReactNode }) {
  return children
}
