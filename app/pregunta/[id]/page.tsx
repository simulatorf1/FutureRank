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

  const desc = q?.description ?? 'Vota esta predicción en FutureRank'
  const title = q?.title ?? 'Pregunta'

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'article',
      images: [
        {
          url: '/opengraph-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: ['/opengraph-image.png'],
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
