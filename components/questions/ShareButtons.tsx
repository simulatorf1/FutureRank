'use client'

import { useState } from 'react'

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const url = typeof window !== 'undefined' ? window.location.href : ''
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(`${title} — ¿Y tú qué crees?`)

  const links = [
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'hover:bg-white/20',
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-green-500/20',
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-blue-500/20',
    },
  ]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs text-white/40">Compartir:</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition ${l.color}`}
        >
          {l.label}
        </a>
      ))}
      <button
        onClick={handleCopy}
        className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
      >
        {copied ? '¡Copiado!' : 'Copiar enlace'}
      </button>
    </div>
  )
}
