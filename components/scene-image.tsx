'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Genre, GENRE_INFO } from '@/lib/game-store'
import { Sparkles, Image as ImageIcon, RefreshCw } from 'lucide-react'
import { cacheImage, getCachedImage } from '@/lib/image-cache'

interface SceneImageProps {
  imagePrompt: string
  genre: Genre
  messageId: string
  protagonistDescription?: string
}

const GENRE_STYLE_SUFFIX: Record<Genre, string> = {
  fantasia: ", high fantasy art, ethereal, digital painting, glowing light, cinematic lighting, magical atmosphere, artstation, highly detailed",
  terror: ", dark gothic horror, eerie, shadow play, foggy, mysterious, digital painting, atmospheric, highly detailed, spooky, cinematic",
  "ficcao-cientifica": ", cyberpunk sci-fi concept art, high-tech, neon glow, holographic, detailed environment, futuristic, cinematic lighting, synthwave",
  investigacao: ", classic film noir, dark moody atmosphere, rainy streets, cinematic shadows, high contrast digital art, dramatic lighting, detective",
  romance: ", warm romantic painting, soft focus, sun flare, emotional, dreamlike digital art, beautiful lighting, peaceful",
  "infantil-aventura": ", cute cartoon illustration, vibrant colors, child friendly, pixar style, 3d render, detailed, cheerful, bright lighting",
  "contos-fadas": ", whimsical fairytale illustration, cute magical setting, castle, friendly dragon, magic glow, storytelling book art, disney concept style",
  "animais-falantes": ", cute anthropomorphic forest animals illustration, children story book style, cozy cottage, watercolor feel, warm lighting, adorable",
}

export function SceneImage({ imagePrompt, genre, messageId, protagonistDescription }: SceneImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  const genreInfo = GENRE_INFO[genre]

  useEffect(() => {
    // Cancelar qualquer requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsLoading(true)
    setHasError(false)
    setImageUrl('')

    const cleanPrompt = imagePrompt.trim().replace(/\s+/g, ' ')
    const styleSuffix = GENRE_STYLE_SUFFIX[genre] || ''
    
    // Concatena a descrição do protagonista para manter fidelidade visual
    const characterContext = protagonistDescription 
      ? `Main character appearance: ${protagonistDescription}. ` 
      : ''
      
    const fullPrompt = characterContext + cleanPrompt + styleSuffix

    const fetchImage = async () => {
      try {
        // Se for carregamento normal (sem ser retry explícito), tenta ler do Cache Storage primeiro
        if (retryCount === 0) {
          const cached = await getCachedImage(messageId)
          if (cached) {
            setImageUrl(cached)
            setIsLoading(false)
            return
          }
        }

        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: fullPrompt }),
          signal: controller.signal,
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          const errMsg = data?.error || `HTTP error: ${response.status}`
          throw new Error(errMsg)
        }
        
        if (data.url) {
          setImageUrl(data.url)
          setIsLoading(false)
          // Salva em background no Cache Storage
          cacheImage(messageId, data.url)
        } else {
          throw new Error('No URL in response')
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') return
        console.error('Image generation failed:', error)
        setIsLoading(false)
        setHasError(true)
      }
    }

    fetchImage()

    return () => {
      controller.abort()
    }
  }, [imagePrompt, genre, messageId, retryCount])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-border/40 bg-muted mb-6 group">
      {/* Background color placeholder specific to the genre */}
      <div className={`absolute inset-0 bg-gradient-to-br ${genreInfo.color} opacity-40`} />

      {/* Image element */}
      {imageUrl && !hasError && (
        <motion.img
          src={imageUrl}
          alt={imagePrompt}
          initial={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="w-full h-full object-cover"
        />
      )}

      {/* Glass Overlay with details */}
      <AnimatePresence>
        {imageUrl && !isLoading && !hasError && (
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
                &ldquo;{imagePrompt}&rdquo;
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
            <p className="text-xs text-muted-foreground/50 mt-1">
              (pode levar até 30 segundos)
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
