import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Genre, GENRE_INFO, SavedGameData } from '@/lib/game-store'
import { gameAudio } from '@/lib/audio-engine'

interface GenreSelectorProps {
  onSelect: (genre: Genre) => void
  onContinue?: (id: string) => void
  savedGames?: SavedGameData[]
  onDelete?: (id: string) => void
  onDeleteAll?: () => void
}

export function GenreSelector({ onSelect, onContinue, savedGames = [], onDelete, onDeleteAll }: GenreSelectorProps) {
  const genres = Object.entries(GENRE_INFO) as [Genre, typeof GENRE_INFO[Genre]][]
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const [bookState, setBookState] = useState<'closed' | 'opening' | 'open'>('closed')

  useEffect(() => {
    // Start opening book after 400ms
    const timer1 = setTimeout(() => {
      setBookState('opening')
      gameAudio.playSFX('page')
    }, 400)
    // Fully opened after 1400ms (matching the flip transition duration)
    const timer2 = setTimeout(() => setBookState('open'), 1400)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])


  const handleDeleteAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirmDeleteAll) {
      onDeleteAll?.()
      setConfirmDeleteAll(false)
    } else {
      setConfirmDeleteAll(true)
      setTimeout(() => setConfirmDeleteAll(false), 3000)
    }
  }

  // Cover variants for 3D page flip
  const coverVariants = {
    closed: { rotateY: 0 },
    opening: { rotateY: -180, transition: { duration: 1.1, ease: [0.645, 0.045, 0.355, 1] } },
    open: { rotateY: -180 },
  } as any

  // Inner content fade-in variants
  const pageContentVariants = {
    closed: { opacity: 0 },
    opening: { opacity: 0 },
    open: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  } as any


  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* 3D Perspective Wrapper */}
      <div 
        className="w-full max-w-5xl h-[700px] md:h-[650px] relative select-none"
        style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}
      >
        {/* ==========================================
            1. CLOSED BOOK COVER (Flipping Page)
            ========================================== */}
        <AnimatePresence>
          {bookState !== 'open' && (
            <motion.div
              variants={coverVariants}
              initial="closed"
              animate={bookState}
              className="absolute inset-0 z-40 origin-left cursor-pointer"
              style={{ 
                transformStyle: 'preserve-3d', 
                backfaceVisibility: 'hidden',
                width: '50%',
                left: '50%'
              }}
            >
              {/* Outer cover front */}
              <div className="absolute inset-0 rounded-r-xl border border-amber-600/30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/90 via-slate-950 to-black p-8 flex flex-col items-center justify-center text-center shadow-[10px_20px_50px_rgba(0,0,0,0.8)]">
                {/* Book design elements */}
                <div className="absolute inset-4 border border-amber-600/20 rounded-lg pointer-events-none" />
                <div className="absolute inset-6 border border-amber-600/10 rounded pointer-events-none" />
                
                <div className="text-amber-500/20 text-9xl absolute pointer-events-none font-serif">✥</div>

                <div className="space-y-4 relative z-10">
                  <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-inner animate-pulse">
                    <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-black text-amber-400 tracking-wider">
                    Crônicas do Destino
                  </h1>
                  <div className="h-px w-24 bg-amber-600/40 mx-auto" />
                  <p className="text-amber-600/70 text-xs tracking-widest uppercase font-serif">
                    Abra o Livro para Iniciar
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
            2. OPENED BOOK LAYOUT (PAGES)
            ========================================== */}
        <div className="absolute inset-0 flex w-full h-full rounded-2xl overflow-hidden bg-[#0c0a12] border border-amber-950/40 shadow-[0_30px_70px_rgba(0,0,0,0.8)]">
          {/* Cover Back Shadow/Border */}
          <div className="absolute inset-2 border border-amber-950/20 rounded pointer-events-none z-20" />

          {/* LEFT PAGE - Intro & Saved Games */}
          <div className="w-full md:w-1/2 h-full bg-[#120f1a] p-6 md:p-8 flex flex-col justify-between border-r border-[#08070d] relative overflow-hidden">
            {/* Left page styling */}
            <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
            <div className="absolute inset-6 border border-border/30 rounded-lg pointer-events-none opacity-50" />

            <motion.div 
              variants={pageContentVariants}
              initial="closed"
              animate={bookState}
              className="relative z-10 flex flex-col justify-between h-full space-y-6"
            >
              {/* Introduction Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Volume I</span>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  Crônicas do Destino
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                  Bem-vindo à guilda. Cada decisão que você tomar criará novos rumos e escreverá histórias extraordinárias sob o poder da Inteligência Artificial. Suas decisões traçam seu legado.
                </p>
              </div>

              {/* Saved Games Scrollbox */}
              <div className="flex-1 flex flex-col min-h-0 pt-4">
                {savedGames.length > 0 && onContinue ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Continuar Jornada
                      </h2>
                      {onDeleteAll && (
                        <button
                          onClick={handleDeleteAll}
                          className={`text-[10px] px-2.5 py-1 rounded border transition-all duration-200 ${
                            confirmDeleteAll
                              ? 'bg-red-500/20 border-red-500/60 text-red-400'
                              : 'border-border/50 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {confirmDeleteAll ? 'Confirmar?' : 'Apagar tudo'}
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent">
                      {savedGames
                        .sort((a, b) => b.updatedAt - a.updatedAt)
                        .map((game) => {
                          const info = GENRE_INFO[game.genre]
                          const date = new Date(game.updatedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })
                          const chapters = Math.ceil(game.messages.filter(m => m.role === 'assistant').length)
                          
                          return (
                            <div key={game.id} className="relative group/item">
                              {onDelete && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(game.id)
                                  }}
                                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-background/80 border border-border/80 text-muted-foreground hover:text-red-400 hover:border-red-400/40 flex items-center justify-center transition-colors"
                                  title="Apagar jornada"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  gameAudio.playSFX('click')
                                  onContinue(game.id)
                                }}
                                className={`w-full p-3.5 rounded-xl border border-border/40 bg-gradient-to-br ${info.color} text-left flex flex-col gap-1 transition-all duration-300 hover:border-primary/50 hover:scale-[1.01]`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xl">{info.icon}</span>
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-background/50 rounded-full text-foreground/80 mr-6">
                                    {info.name}
                                  </span>
                                </div>
                                <div className="mt-1">
                                  <h4 className="text-xs font-bold text-foreground truncate pr-6">{game.playerName}</h4>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{chapters} capítulos • {date}</p>
                                </div>
                              </button>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-border/40 rounded-xl text-center">
                    <span className="text-2xl text-muted-foreground/40 mb-2">✥</span>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nenhuma jornada salva</h3>
                    <p className="text-[10px] text-muted-foreground/60 max-w-[200px] mt-1">Crie sua primeira crônica escolhendo um gênero ao lado.</p>
                  </div>
                )}
              </div>

              {/* Spine indicator */}
              <div className="text-[10px] text-muted-foreground/40 text-left">
                Garantia de crônicas geradas unicamente por inteligência artificial.
              </div>
            </motion.div>
          </div>

          {/* MIDDLE SPINE OF THE BOOK */}
          <div className="hidden md:block w-3.5 h-full bg-gradient-to-r from-black via-amber-950/20 to-black border-x border-[#05040a] relative z-20 shadow-inner">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-amber-600/10" />
          </div>

          {/* RIGHT PAGE - Genre Selector */}
          <div className="hidden md:flex md:w-1/2 h-full bg-[#120f1a] p-6 md:p-8 flex-col justify-between relative overflow-hidden">
            {/* Right page styling */}
            <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
            <div className="absolute inset-6 border border-border/30 rounded-lg pointer-events-none opacity-50" />

            <motion.div
              variants={pageContentVariants}
              initial="closed"
              animate={bookState}
              className="relative z-10 flex flex-col h-full space-y-6"
            >
              <div className="space-y-1">
                <h2 className="font-serif text-2xl font-bold text-foreground">Escolha seu Gênero</h2>
                <p className="text-xs text-muted-foreground">Selecione o cenário inicial para sua aventura</p>
              </div>

              {/* Genre cards vertical list to fit perfectly */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent">
                {genres.map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => {
                      gameAudio.playSFX('page')
                      onSelect(key)
                    }}
                    className={`w-full group p-4.5 rounded-xl border border-border/40 bg-gradient-to-br ${info.color} text-left flex items-start gap-4 transition-all duration-300 hover:border-primary/50 hover:scale-[1.01] relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <span className="text-3xl p-2 bg-background/40 rounded-xl shadow-inner flex-shrink-0">{info.icon}</span>
                    
                    <div className="relative z-10 space-y-1 flex-1">
                      <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {info.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed pr-2">
                        {info.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-muted-foreground/40 text-right mt-auto">
                Volume I • Pág. 1
              </div>
            </motion.div>
          </div>

          {/* MOBILE RESPONSIVE PAGE ACCORDION FLATTENER */}
          <div className="md:hidden absolute inset-0 z-30 flex flex-col overflow-y-auto bg-[#120f1a] p-6 space-y-8">
            <motion.div
              variants={pageContentVariants}
              initial="closed"
              animate={bookState}
              className="space-y-8"
            >
              {/* Introduction Details */}
              <div className="space-y-3">
                <h1 className="font-serif text-3xl font-extrabold text-foreground tracking-tight">
                  Crônicas do Destino
                </h1>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Cada decisão que você tomar criará novos rumos e escreverá histórias extraordinárias sob o poder da Inteligência Artificial.
                </p>
              </div>

              {/* Genre cards vertical list */}
              <div className="space-y-4">
                <h2 className="font-serif text-xl font-bold text-foreground">Escolha seu Gênero</h2>
                <div className="grid grid-cols-1 gap-3.5">
                  {genres.map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => {
                        gameAudio.playSFX('page')
                        onSelect(key)
                      }}
                      className={`w-full group p-4 rounded-xl border border-border/40 bg-gradient-to-br ${info.color} text-left flex items-start gap-4 transition-all duration-300`}
                    >
                      <span className="text-3xl p-1.5 bg-background/40 rounded-lg">{info.icon}</span>
                      <div className="space-y-0.5 flex-1">
                        <h3 className="font-serif text-base font-bold text-foreground">{info.name}</h3>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{info.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Saved Games */}
              {savedGames.length > 0 && onContinue && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-t border-border/30 pt-4">
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Continuar Jornada
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {savedGames
                      .sort((a, b) => b.updatedAt - a.updatedAt)
                      .map((game) => {
                        const info = GENRE_INFO[game.genre]
                        const date = new Date(game.updatedAt).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })
                        const chapters = Math.ceil(game.messages.filter(m => m.role === 'assistant').length)
                        
                        return (
                          <div key={game.id} className="relative">
                            {onDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDelete(game.id)
                                }}
                                className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-background/80 border border-border/80 text-muted-foreground flex items-center justify-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                gameAudio.playSFX('click')
                                onContinue(game.id)
                              }}
                              className={`w-full p-4 rounded-xl border border-border/40 bg-gradient-to-br ${info.color} text-left flex flex-col gap-1`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xl">{info.icon}</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 bg-background/50 rounded-full text-foreground/80 mr-6">
                                  {info.name}
                                </span>
                              </div>
                              <div className="mt-1">
                                <h4 className="text-xs font-bold text-foreground truncate pr-6">{game.playerName}</h4>
                                <p className="text-[9px] text-muted-foreground mt-0.5">{chapters} capítulos • {date}</p>
                              </div>
                            </button>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
