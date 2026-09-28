'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function StatsBanner() {
  const [stats, setStats] = useState({
    questions: 0,
    votes: 0,
    users: 0,
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.rpc('get_global_stats')

      if (data && data[0]) {
        setStats({
          questions: Number(data[0].questions ?? 0),
          votes: Number(data[0].votes ?? 0),
          users: Number(data[0].users ?? 0),
        })
      }
    }
    load()
  }, [])

  return (
    <div className="mb-8 grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="text-center">
        <div className="text-xl font-semibold">{stats.questions}</div>
        <div className="text-xs text-white/40">Preguntas</div>
      </div>
      <div className="border-x border-white/10 text-center">
        <div className="text-xl font-semibold">{stats.votes}</div>
        <div className="text-xs text-white/40">Predicciones</div>
      </div>
      <div className="text-center">
        <div className="text-xl font-semibold">{stats.users}</div>
        <div className="text-xs text-white/40">Usuarios</div>
      </div>
    </div>
  )
}
