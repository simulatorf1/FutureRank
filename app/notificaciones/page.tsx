'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '@/lib/notifications'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const data = await getMyNotifications()
    setNotifications(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleRead = async (id: number) => {
    await markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
  }

  const handleReadAll = async () => {
    await markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Notificaciones</h1>
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleReadAll}
              className="text-xs text-white/40 transition hover:text-white"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-white/40">
            No tienes notificaciones todavía. Vota preguntas y te avisaremos cuando se resuelvan.
          </p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.question_id ? `/pregunta/${n.question_id}` : '#'}
                onClick={() => handleRead(n.id)}
                className={`block rounded-lg border p-4 transition ${
                  n.is_read
                    ? 'border-white/10 bg-white/5'
                    : 'border-white/20 bg-white/[0.07] hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    {n.payload.was_correct ? '✅' : '❌'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-white/80">
                      <strong className="text-white">{n.payload.question_title}</strong>
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      Resultado correcto: <span className="text-white/80">{n.payload.correct_option}</span>
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span
                        className={
                          n.payload.was_correct ? 'text-green-400' : 'text-white/40'
                        }
                      >
                        {n.payload.was_correct
                          ? `Acertaste · +${n.payload.points ?? 0} puntos`
                          : 'Fallaste · 0 puntos'}
                      </span>
                      <span className="text-white/30">{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                  {!n.is_read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
