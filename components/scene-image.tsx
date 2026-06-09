'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Genre, GENRE_INFO } from '@/lib/game-store'
import { Sparkles, Image as ImageIcon, RefreshCw } from 'lucide-react'

interface SceneImageProps {
  imagePrompt: string
  genre: Genre
  messageId: string
}

const GENRE_STYLE_SUFFIX: Record<Genre, string> = {
  fantasia: ", high fantasy art, ethereal, digital painting, glowing light, cinematic lighting, magical atmosphere, artstation, detailed",
  terror: ", dark gothic horror, eerie, shadow play, foggy, mysterious, digital painting, atmospheric, highly detailed, spooky, cinematic",
  "ficcao-cientifica": ", cyberpunk sci-fi concept art, high-tech, neon glow, holographic, detailed environment, futuristic, cinematic lighting, synthwave",
  investigacao: ", classic film noir, dark moody atmosphere, rainy streets, cinematic shadows, high contrast digital art, dramatic lighting, detective",
  romance: ", warm romantic painting, soft focus, sun flare, emotional, dreamlike digital art, beautiful lighting, peaceful",
}

function getSeedFromString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function SceneImage({ imagePrompt, genre, messageId }: SceneImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const genreInfo = GENRE_INFO[genre]
  const seed = getSeedFromString(messageId + retryCount.toString())

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)

    // Limpar o prompt e remover quebras de linha/espaços extras
    const cleanPrompt = imagePrompt.trim().replace(/\s+/g, ' ')
    const styleSuffix = GENRE_STYLE_SUFFIX[genre] || ''
    
    // URL do Pollinations AI
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + styleSuffix)}?width=1024&height=576&nologo=true&seed=${seed}`
    setImageUrl(url)
  }, [imagePrompt, genre, messageId, seed, retryCount])

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-border/40 bg-muted mb-6 group">
      {/* Background color placeholder specific to the genre */}
      <div className={`absolute inset-0 bg-gradient-to-br ${genreInfo.color} opacity-40`} />

      {/* Image element */}
      {imageUrl && !hasError && (
        <img
          src={imageUrl}
          alt={imagePrompt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-all duration-1000 ${
            isLoading ? 'scale-105 blur-lg opacity-0' : 'scale-100 blur-0 opacity-100'
          }`}
        />
      )}

      {/* Glass Overlay with details */}
      <AnimatePresence>
        {!isLoading && !hasError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="flex items-center gap-2 text-white/90 max-w-[85%]">
              <Sparkles className="w-4 h-4 text-primary shrink-0 animate-pulse" />
              <p className="text-xs font-medium truncate italic" title={imagePrompt}>
                "{imagePrompt}"
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-colors shrink-0"
              title="Gerar outra imagem"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="mb-3"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <p className="text-xs text-muted-foreground animate-pulse font-serif">
              Materializando a visão da cena...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6 text-center"
          >
            <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-white mb-2">
              Não foi possível materializar a imagem
            </p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
