import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Contenido from './Contenido'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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

  if (!q) {
    return { title: 'Pregunta no encontrada' }
  }

  const desc = q.description ?? 'Vota esta predicción en FutureRank'

  return {
    title: q.title,
    description: desc,
    openGraph: {
      title: q.title,
      description: desc,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: q.title,
      description: desc,
    },
  }
}

export default function QuestionPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<main className="p-12">Cargando...</main>}>
        <Contenido />
      </Suspense>
      <Footer />
    </>
  )
}
