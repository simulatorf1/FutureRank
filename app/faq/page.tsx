import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Preguntas frecuentes — FutureRank',
  description:
    'Respuestas a las dudas más comunes sobre FutureRank: votos, puntos, rankings, privacidad y más.',
}

const FAQ = [
  {
    q: '¿Necesito registrarme para votar?',
    a: 'No. Puedes votar cualquier pregunta sin crear cuenta. Tu voto queda guardado automáticamente. Si después decides crear una cuenta, ese voto se conserva y empieza a contar en tu historial.',
  },
  {
    q: '¿Es una casa de apuestas o una web de encuestas?',
    a: 'No es ninguna de las dos. No hay dinero real, no hay cuotas, no hay apuestas. Tampoco es una encuesta: aquí las opiniones se registran y se resuelven con resultados reales, construyendo un historial permanente de aciertos y errores.',
  },
  {
    q: '¿Cómo se calculan los puntos?',
    a: 'Los puntos se otorgan solo cuando una pregunta se resuelve, y dependen de la dificultad. Acertar algo que muy pocos votaron vale mucho más que acertar algo obvio. La fórmula es: puntos = 10 / (fracción de aciertos + 0.1).',
  },
  {
    q: '¿Pierdo puntos si fallo?',
    a: 'No. Los fallos no restan puntos. El sistema premia positivamente para no desincentivar la participación. Si no aciertas, simplemente no sumas en esa pregunta.',
  },
  {
    q: '¿Qué pasa si dos usuarios aciertan lo mismo?',
    a: 'Ambos ganan los mismos puntos. La fórmula depende de cuánta gente votó la opción correcta, no de cuántos acertaron. Si 10 personas aciertan una opción que recibió el 20% de los votos, todos reciben los mismos puntos.',
  },
  {
    q: '¿Quién decide el resultado de una pregunta?',
    a: 'El equipo de moderación de FutureRank verifica el resultado cuando llega la fecha de resolución, usando la fuente de verificación indicada en la propia pregunta (por ejemplo, la web oficial de un torneo, un medio financiero, un boletín oficial).',
  },
  {
    q: '¿Qué pasa si una pregunta no se puede resolver?',
    a: 'Si la pregunta no se puede verificar objetivamente, se cierra sin otorgar puntos. En ese caso, no afecta a las estadísticas de nadie.',
  },
  {
    q: '¿Puedo crear mis propias preguntas?',
    a: 'Sí. Cualquier usuario registrado puede crear preguntas desde el enlace "Crear pregunta" del menú. Cada pregunta pasa por moderación para evitar spam, duplicados o preguntas imposibles de verificar.',
  },
  {
    q: '¿Cómo se ordenan los comentarios?',
    a: 'Puedes ordenarlos por "Top" (los más votados positivamente) o por "Nuevos". El sistema de votos funciona como en Reddit: puedes dar voto positivo o negativo a cada comentario para destacar los argumentos más útiles.',
  },
  {
    q: '¿Qué pasa con mi voto si me registro después de votar?',
    a: 'Se conserva automáticamente. Tu voto queda ligado a tu identificador de usuario, y ese identificador no cambia al convertirte en usuario registrado. No tienes que votar otra vez.',
  },
  {
    q: '¿Puedo cambiar mi nombre o mi descripción?',
    a: 'Sí. Desde tu perfil público (arriba a la derecha en "Mi perfil") puedes editar tu nombre y tu descripción. El cambio se refleja en todos los sitios donde apareces.',
  },
  {
    q: '¿Se puede votar después de la fecha de cierre?',
    a: 'No. Aunque el estado de la pregunta siga como "abierta" internamente, en cuanto se pasa la fecha de resolución el sistema bloquea automáticamente cualquier intento de voto.',
  },
  {
    q: '¿Los rankings se actualizan en tiempo real?',
    a: 'Sí. Cada vez que se resuelve una pregunta, los rankings globales y por categoría se recalculan inmediatamente con los nuevos puntos.',
  },
  {
    q: '¿Puedo ver el historial de otro usuario?',
    a: 'Sí. Cada perfil público es visible para cualquiera. Puedes consultar la precisión, las predicciones y las posiciones en rankings de cualquier usuario desde su enlace de perfil.',
  },
  {
    q: '¿Qué categorías existen?',
    a: 'Actualmente hay seis categorías principales: Deportes, Tecnología, Economía, Política, Entretenimiento y Ciencia. Cada una tiene subcategorías (Fútbol, F1, Bitcoin, IA, Elecciones, Videojuegos...).',
  },
  {
    q: '¿Cómo contacto con vosotros?',
    a: 'Puedes escribirnos a través de las redes sociales de FutureRank. Los enlaces están en la página principal y en el footer.',
  },
]

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">
          Preguntas frecuentes
        </h1>
        <p className="mb-12 text-white/60">
          Todo lo que necesitas saber sobre FutureRank. Si te queda alguna duda, échale un
          vistazo a la sección{' '}
          <Link href="/como-funciona" className="text-white underline">
            Cómo funciona
          </Link>
          .
        </p>

        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <details
              key={i}
              className="group rounded-lg border border-white/10 bg-white/5 transition hover:border-white/20"
            >
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium">
                {item.q}
                <span className="text-white/40 transition group-open:rotate-45">+</span>
              </summary>
              <div className="border-t border-white/5 px-4 py-3 text-sm text-white/70">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-3 text-lg font-semibold">¿Aún con dudas?</h2>
          <p className="mb-4 text-sm text-white/70">
            Echa un vistazo a la guía completa o empieza directamente votando una pregunta.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/como-funciona"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Cómo funciona
            </Link>
            <Link
              href="/"
              className="rounded-md border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Ver preguntas
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
