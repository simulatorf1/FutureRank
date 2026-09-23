import { getQuestionBySlugOrId } from '@/lib/questions'
import { VoteButtons } from '@/components/questions/VoteButtons'

export default async function ProbarVotoPage() {
  // Cambia este ID por el de tu pregunta de prueba
  const questionId = 3

  const question = await getQuestionBySlugOrId(questionId)

  if (!question) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-white/60">No se encontró la pregunta. Revisa el ID.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-2 text-xs uppercase tracking-wide text-white/40">
        {question.category_name}
      </div>
      <h1 className="mb-2 text-2xl font-semibold">{question.title}</h1>
      {question.description && (
        <p className="mb-6 text-sm text-white/60">{question.description}</p>
      )}
      <VoteButtons questionId={question.id} options={question.options} />
    </main>
  )
}
