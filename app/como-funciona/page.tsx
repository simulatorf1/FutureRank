import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Cómo funciona — FutureRank',
  description:
    'Descubre cómo funciona FutureRank: vota predicciones, gana puntos por acertar y compite en rankings por categoría.',
}

export default function ComoFuncionaPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">Cómo funciona</h1>
        <p className="mb-12 text-white/60">
          FutureRank es una red social de predicciones donde se registra quién acierta y
          quién falla. Sin dinero, sin apuestas. Solo tu historial.
        </p>

        {/* Bloque 1 */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">1. Vota sin registrarte</h2>
          <p className="mb-4 text-white/70">
            Puedes votar cualquier pregunta sin crear una cuenta. Al pulsar una opción, tu
            voto queda guardado y ves los resultados al instante.
          </p>
          <p className="text-white/70">
            Si decides crear una cuenta después, <strong className="text-white">tu voto
            anterior se conserva automáticamente</strong> y pasará a contar en tu historial.
            No tienes que votar dos veces.
          </p>
        </section>

        {/* Bloque 2 */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">2. Cada pregunta tiene una fecha</h2>
          <p className="mb-4 text-white/70">
            Toda pregunta en FutureRank tiene una fecha de resolución. Antes de esa fecha,
            cualquier persona puede votar. Después, el voto se bloquea y espera a que se
            publique el resultado real.
          </p>
          <p className="text-white/70">
            En la tarjeta de cada pregunta verás la cuenta atrás ("Cierra en 3d") para que
            sepas cuánto tiempo queda para votar.
          </p>
        </section>

        {/* Bloque 3 */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">3. Cómo se ganan los puntos</h2>
          <p className="mb-4 text-white/70">
            Cuando una pregunta se resuelve, se otorgan puntos a quienes acertaron. Los
            puntos se calculan según la <strong className="text-white">dificultad</strong> de
            la predicción:
          </p>
          <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-sm text-white/60">
              Fórmula: <code className="rounded bg-black/30 px-1.5 py-0.5">puntos = 10 / (fracción_aciertos + 0.1)</code>
            </p>
          </div>
          <p className="mb-4 text-white/70">
            En otras palabras: si acertaste algo que <strong className="text-white">muy pocos
            votaron</strong>, ganas muchos puntos. Si acertaste algo que casi todo el mundo
            votó, ganas pocos. Ejemplos:
          </p>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-2 text-left text-white/60">
                    % que votó tu opción
                  </th>
                  <th className="px-4 py-2 text-right text-white/60">Puntos</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/5">
                  <td className="px-4 py-2">10% (muy pocos te siguieron)</td>
                  <td className="px-4 py-2 text-right text-green-400">91 pts</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="px-4 py-2">25%</td>
                  <td className="px-4 py-2 text-right text-green-400">38 pts</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="px-4 py-2">50%</td>
                  <td className="px-4 py-2 text-right text-green-400">20 pts</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="px-4 py-2">75%</td>
                  <td className="px-4 py-2 text-right text-green-400">13 pts</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="px-4 py-2">90% (obvio)</td>
                  <td className="px-4 py-2 text-right text-green-400">11 pts</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-white/70">
            <strong className="text-white">Fallar no resta puntos.</strong> El sistema premia
            positivamente para no desincentivar la participación.
          </p>
        </section>

        {/* Bloque 4 */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">4. Rankings por categoría</h2>
          <p className="mb-4 text-white/70">
            No existe solo un ranking global. Cada categoría (Deportes, Tecnología,
            Economía...) y cada subcategoría (F1, Bitcoin, IA...) tiene su propio ranking.
          </p>
          <p className="text-white/70">
            Eso significa que <strong className="text-white">puedes ser el número 1 en
            MotoGP</strong> sin necesidad de ser experto en todo. Encuentra tu nicho y
            destaca en él.
          </p>
        </section>

        {/* Bloque 5 */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">5. Comentarios y debate</h2>
          <p className="mb-4 text-white/70">
            Cada pregunta tiene su propia zona de debate. Puedes argumentar tu posición,
            responder a otros usuarios y votar los comentarios más útiles para que suban.
          </p>
          <p className="text-white/70">
            Los votos dicen qué cree la gente. Los comentarios dicen por qué.
          </p>
        </section>

        {/* Bloque 6 */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">6. Tu perfil público</h2>
          <p className="mb-4 text-white/70">
            Cada usuario tiene una página pública con sus estadísticas: precisión, número de
            predicciones, puntos, posición global y posiciones por categoría.
          </p>
          <p className="text-white/70">
            Es tu carta de presentación como "persona que sabe predecir". Con el tiempo, se
            convierte en tu historial verificable.
          </p>
        </section>

        {/* Bloque 7 */}
        <section className="mb-12 rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-3 text-lg font-semibold">¿Listo para empezar?</h2>
          <p className="mb-4 text-sm text-white/70">
            Entra en la portada, elige una pregunta y vota. No necesitas cuenta.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Ver preguntas
            </Link>
            <Link
              href="/faq"
              className="rounded-md border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Leer preguntas frecuentes
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
