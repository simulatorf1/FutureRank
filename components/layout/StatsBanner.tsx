'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function StatsBanner() {
  const [stats, setStats] = useState({
    questions: 0,
    predictions: 0,
    users: 0,
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [qCount, vCount, pCount] = await Promise.all([
        supabase.from('questions').select('id', { count: 'exact', head: true }),
        supabase.from('votes').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ])

      setStats({
        questions: qCount.count ?? 0,
        predictions: vCount.count ?? 0,
        users: pCount.count ?? 0,
      })
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
        <div className="text-xl font-semibold">{stats.predictions}</div>
        <div className="text-xs text-white/40">Predicciones</div>
      </div>
      <div className="text-center">
        <div className="text-xl font-semibold">{stats.users}</div>
        <div className="text-xs text-white/40">Usuarios</div>
      </div>
    </div>
  )
}
