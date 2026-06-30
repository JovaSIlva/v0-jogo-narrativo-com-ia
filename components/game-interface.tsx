'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Genre, GENRE_INFO, parseChoices } from '@/lib/game-store'
import { StoryDisplay } from './story-display'
import { ChoiceButtons } from './choice-buttons'
import { SceneImage } from './scene-image'
import { BookReader } from './book-reader'
import { PrintLayout } from './print-layout'
import { UIMessage } from 'ai'

interface GameInterfaceProps {
  genre: Genre
  playerName: string
  messages: UIMessage[]
  isStreaming: boolean
  onChoice: (choice: string) => void
  onRestart: () => void
  onRollback?: () => void
  protagonistDescription?: string
}

export function GameInterface({ 
  genre, 
  playerName, 
  messages, 
  isStreaming, 
  onChoice,
  onRestart,
  onRollback,
  protagonistDescription
}: GameInterfaceProps) {
  const genreInfo = GENRE_INFO[genre]
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isBookOpen, setIsBookOpen] = useState(false)
  
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
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md print:hidden">
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
          
          <div className="flex items-center gap-3">
            {onRollback && messages.filter(m => m.role === 'assistant').length > 1 && !isStreaming && (
              <button
                onClick={onRollback}
                className="text-xs px-3 py-1.5 rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Desfazer última escolha e voltar um capítulo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7v6h6"/>
                  <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                </svg>
                Voltar Capítulo
              </button>
            )}

            <button
              onClick={onRestart}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Menu Inicial
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto print:hidden"
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
                {imagePrompt && !isStreaming && (
                  <SceneImage
                    imagePrompt={imagePrompt}
                    genre={genre}
                    messageId={latestAssistantMessage?.id || messages.length.toString()}
                    protagonistDescription={protagonistDescription}
                  />
                )}

                <StoryDisplay 
                  narrative={narrative} 
                  isStreaming={isStreaming && choices.length === 0} 
                />
                
                {!isStreaming && choices.length > 0 && (
                  <>
                    <ChoiceButtons
                      choices={choices}
                      onSelect={onChoice}
                      disabled={isStreaming}
                    />

                    {messages.filter(m => m.role === 'assistant').length >= 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 flex justify-center"
                      >
                        <button
                          onClick={() => onChoice("Eu decido concluir minha jornada e ver o desfecho da história. [FINAL]")}
                          className="px-5 py-2.5 rounded-xl border border-dashed border-border/80 hover:border-destructive/50 text-muted-foreground hover:text-destructive bg-card/30 hover:bg-destructive/5 transition-all text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
                        >
                          <span>📕 Concluir Jornada e Gerar Livro</span>
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Tela de Fim de Jogo */}
                {!isStreaming && choices.length === 0 && messages.filter(m => m.role === 'assistant').length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-12 p-8 rounded-2xl border border-primary/20 bg-card/60 text-center space-y-6 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50" />
                    
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary text-3xl animate-bounce">
                      👑
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                        Sua história chegou ao fim!
                      </h2>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Você concluiu sua jornada nas Crônicas do Destino. Agora você pode visualizar seu livro ilustrado completo e salvá-lo como PDF.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                      <button
                        onClick={() => setIsBookOpen(true)}
                        className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all cursor-pointer"
                      >
                        📖 Visualizar e Salvar Livro (PDF)
                      </button>
                      
                      <button
                        onClick={onRestart}
                        className="w-full sm:w-auto px-6 py-3.5 bg-secondary hover:bg-secondary/85 text-secondary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all cursor-pointer"
                      >
                        🔄 Menu Inicial
                      </button>
                    </div>
                  </motion.div>
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
      <footer className="border-t border-border/30 py-3 print:hidden">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center">
          <p className="text-xs text-muted-foreground/50">
            Capítulo {Math.max(1, messages.filter(m => m.role === 'assistant').length)}
          </p>
        </div>
      </footer>

      {/* Modais e Layouts de Impressão */}
      <BookReader
        genre={genre}
        playerName={playerName}
        messages={messages}
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
      />

      <PrintLayout
        genre={genre}
        playerName={playerName}
        messages={messages}
      />
    </div>
  )
}
