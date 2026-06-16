'use client'

import { useEffect, useState } from 'react'
import { getCachedImage } from '@/lib/image-cache'
import { ImageIcon } from 'lucide-react'

interface BookPageImageProps {
  messageId: string
  alt: string
  genreColor: string
}

export function BookPageImage({ messageId, alt, genreColor }: BookPageImageProps) {
  const [src, setSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    let intervalId: any

    async function load() {
      const cached = await getCachedImage(messageId)
      if (active) {
        if (cached) {
          setSrc(cached)
          setLoading(false)
          if (intervalId) clearInterval(intervalId)
        } else {
          // Se não encontrou, continua no estado de loading para tentar novamente no próximo ciclo
          setLoading(true)
        }
      }
    }

    load()

    // Verifica a cada 2 segundos se a imagem foi gerada e gravada no cache
    intervalId = setInterval(load, 2000)

    return () => {
      active = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [messageId])

  if (loading) {
    return (
      <div className={`w-full aspect-video rounded-xl bg-gradient-to-br ${genreColor} opacity-20 animate-pulse flex items-center justify-center`}>
        <span className="text-xs text-muted-foreground/60 font-serif">Visualizando memórias...</span>
      </div>
    )
  }

  if (!src) {
    return (
      <div className={`w-full aspect-video rounded-xl bg-gradient-to-br ${genreColor} opacity-35 border border-current/10 flex flex-col items-center justify-center p-6 text-center`}>
        <ImageIcon className="w-8 h-8 opacity-40 mb-2" />
        <span className="text-xs font-serif italic max-w-[240px] opacity-60 leading-relaxed">
          &ldquo;A imaginação preenche os detalhes desta cena...&rdquo;
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full aspect-video object-cover rounded-xl shadow-lg border border-current/10"
    />
  )
}
