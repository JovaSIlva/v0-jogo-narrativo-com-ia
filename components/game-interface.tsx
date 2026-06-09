'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Genre, GENRE_INFO, parseChoices } from '@/lib/game-store'
import { StoryDisplay } from './story-display'
import { ChoiceButtons } from './choice-buttons'
import { SceneImage } from './scene-image'
import { UIMessage } from 'ai'

interface GameInterfaceProps {
  genre: Genre
  playerName: string
  messages: UIMessage[]
  isStreaming: boolean
  onChoice: (choice: string) => void
  onRestart: () => void
}

export function GameInterface({ 
  genre, 
  playerName, 
  messages, 
  isStreaming, 
  onChoice,
  onRestart 
}: GameInterfaceProps) {
  const genreInfo = GENRE_INFO[genre]
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Get the latest assistant message
  const latestAssistantMessage = messages
    .filter(m => m.role === 'assistant')
    .at(-1)
  
  const messageText = latestAssistantMessage?.parts
    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map(p => p.text)
    .join('') || ''
  
  const { narrative, choices, imagePrompt } = parseChoices(messageText)
  
  // Get history of past scenes (excluding the latest)
  const pastScenes = messages
    .filter(m => m.role === 'assistant')
    .slice(0, -1)
    .map(m => {
      const text = m.parts
        ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map(p => p.text)
        .join('') || ''
      return parseChoices(text).narrative
    })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messageText])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{genreInfo.icon}</span>
            <div>
              <h1 className="font-serif text-lg font-semibold text-foreground">
                Crônicas do Destino
              </h1>
              <p className="text-xs text-muted-foreground">
                {genreInfo.name} • {playerName}
              </p>
            </div>
          </div>
          
          <button
            onClick={onRestart}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Reiniciar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <AnimatePresence mode="wait">
            {/* Past scenes as collapsed history */}
            {pastScenes.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 space-y-4"
              >
                {pastScenes.map((scene, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    className="border-l-2 border-border/30 pl-4"
                  >
                    <p className="font-serif text-sm text-muted-foreground line-clamp-3">
                      {scene}
                    </p>
                  </motion.div>
                ))}
                <div className="h-px bg-gradient-to-r from-border via-primary/30 to-border" />
              </motion.div>
            )}

            {/* Current scene */}
            {narrative && (
              <motion.div
                key={messages.length}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {imagePrompt && (
                  <SceneImage
                    imagePrompt={imagePrompt}
                    genre={genre}
                    messageId={latestAssistantMessage?.id || messages.length.toString()}
                  />
                )}

                <StoryDisplay 
                  narrative={narrative} 
                  isStreaming={isStreaming && choices.length === 0} 
                />
                
                {!isStreaming && choices.length > 0 && (
                  <ChoiceButtons
                    choices={choices}
                    onSelect={onChoice}
                    disabled={isStreaming}
                  />
                )}
              </motion.div>
            )}

            {/* Loading state */}
            {isStreaming && !narrative && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-border" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <p className="mt-6 text-muted-foreground text-sm">
                  Tecendo os fios do destino...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-3">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center">
          <p className="text-xs text-muted-foreground/50">
            Capítulo {Math.max(1, messages.filter(m => m.role === 'assistant').length)}
          </p>
        </div>
      </footer>
    </div>
  )
}
