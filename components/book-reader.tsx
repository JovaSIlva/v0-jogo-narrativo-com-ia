'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import { Genre, GENRE_INFO, parseChoices } from '@/lib/game-store'
import { BookPageImage } from './book-page-image'
import { X, ChevronLeft, ChevronRight, Printer, Sparkles } from 'lucide-react'
import { UIMessage } from 'ai'

interface BookReaderProps {
  genre: Genre
  playerName: string
  messages: UIMessage[]
  isOpen: boolean
  onClose: () => void
}

interface ThemeStyle {
  bookBg: string
  textColor: string
  borderColor: string
  accentColor: string
  fontClass: string
  borderStyle: string
}

const THEME_STYLES: Record<Genre, ThemeStyle> = {
  fantasia: {
    bookBg: 'bg-[#f4ebd0]', // Pergaminho
    textColor: 'text-[#2b1f0d]',
    borderColor: 'border-[#b59e70]',
    accentColor: 'text-[#8b5a2b]',
    fontClass: 'font-serif',
    borderStyle: 'border-4 border-double',
  },
  terror: {
    bookBg: 'bg-[#18181b]', // Charcoal
    textColor: 'text-[#f4f4f5]',
    borderColor: 'border-[#7f1d1d]',
    accentColor: 'text-[#ef4444]',
    fontClass: 'font-serif',
    borderStyle: 'border-2 border-solid shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]',
  },
  "ficcao-cientifica": {
    bookBg: 'bg-[#0f172a]', // Deep blue
    textColor: 'text-[#f1f5f9]',
    borderColor: 'border-[#06b6d4]',
    accentColor: 'text-[#22d3ee]',
    fontClass: 'font-mono',
    borderStyle: 'border border-solid shadow-[0_0_15px_rgba(6,182,212,0.2)]',
  },
  investigacao: {
    bookBg: 'bg-[#e5e5e5]', // Typewriter grey
    textColor: 'text-[#18181b]',
    borderColor: 'border-[#27272a]',
    accentColor: 'text-[#52525b]',
    fontClass: 'font-mono',
    borderStyle: 'border-2 border-dashed',
  },
  romance: {
    bookBg: 'bg-[#fff5f5]', // Soft pink-cream
    textColor: 'text-[#4c0519]',
    borderColor: 'border-[#f472b6]',
    accentColor: 'text-[#db2777]',
    fontClass: 'font-serif',
    borderStyle: 'border-2 border-double rounded-2xl',
  },
  "infantil-aventura": {
    bookBg: 'bg-[#fefce8]', // Warm pastel yellow
    textColor: 'text-[#713f12]',
    borderColor: 'border-[#eab308]',
    accentColor: 'text-[#ca8a04]',
    fontClass: 'font-sans',
    borderStyle: 'border-4 border-dashed rounded-3xl',
  },
  "contos-fadas": {
    bookBg: 'bg-[#faf5ff]', // Soft purple
    textColor: 'text-[#581c87]',
    borderColor: 'border-[#c084fc]',
    accentColor: 'text-[#9333ea]',
    fontClass: 'font-serif',
    borderStyle: 'border-4 border-double rounded-3xl',
  },
  "animais-falantes": {
    bookBg: 'bg-[#f0fdf4]', // Soft green
    textColor: 'text-[#14532d]',
    borderColor: 'border-[#4ade80]',
    accentColor: 'text-[#16a34a]',
    fontClass: 'font-sans',
    borderStyle: 'border-2 border-solid rounded-3xl',
  },
}

export function BookReader({ genre, playerName, messages, isOpen, onClose }: BookReaderProps) {
  const genreInfo = GENRE_INFO[genre]
  const theme = THEME_STYLES[genre] || THEME_STYLES.fantasia

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Filtrar apenas as mensagens do assistente (as cenas da história)
  const assistantMessages = messages.filter((m) => m.role === 'assistant')

  useEffect(() => {
    // Total de slides: capa + cenas + contracapa
    setTotalPages(assistantMessages.length + 2)
  }, [assistantMessages.length])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 print:hidden">
        {/* Header de Ações do Modal */}
        <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
          <div className="text-white/80 text-xs md:text-sm font-medium">
            Leitor de Livro • {genreInfo.name}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 hover:scale-105 transition-all shadow-md cursor-pointer"
              title="Salvar como PDF / Imprimir"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-all hover:scale-105 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo do Livro / Carrossel */}
        <div className="w-full max-w-lg flex flex-col items-center justify-center">
          <div className="relative w-full flex items-center">
            {/* Botão Anterior */}
            {selectedIndex > 0 && (
              <button
                onClick={scrollPrev}
                className="absolute -left-12 lg:-left-16 z-25 p-2.5 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 text-white/80 hover:text-white transition-all cursor-pointer hidden md:block"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Slider de Páginas do Livro */}
            <div className="overflow-hidden w-full" ref={emblaRef}>
              <div className="flex">
                
                {/* 1. CAPA DO LIVRO */}
                <div className="flex-[0_0_100%] min-w-0 px-2 flex justify-center">
                  <div className={`w-full aspect-[1/1.414] max-h-[75vh] flex flex-col justify-between p-8 md:p-12 ${theme.bookBg} ${theme.textColor} ${theme.borderColor} ${theme.borderStyle} ${theme.fontClass} relative select-none shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
                    
                    {/* Detalhes Estéticos */}
                    {genre === 'fantasia' && (
                      <div className="absolute inset-4 border border-[#b59e70]/40 pointer-events-none rounded" />
                    )}
                    {genre === 'investigacao' && (
                      <div className="absolute top-4 right-4 rotate-6 border-2 border-red-700 text-red-700 px-3 py-1 font-bold text-xs uppercase tracking-wider opacity-60">
                        CONFIDENCIAL
                      </div>
                    )}
                    
                    <div className="text-center pt-8">
                      <p className={`text-xs uppercase tracking-widest font-semibold ${theme.accentColor} opacity-70`}>
                        Coleção Crônicas do Destino
                      </p>
                      <div className="w-12 h-px bg-current mx-auto my-3 opacity-30" />
                    </div>

                    <div className="text-center my-auto space-y-4">
                      <span className="text-5xl block animate-pulse">{genreInfo.icon}</span>
                      <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight uppercase">
                        Crônicas do Destino
                      </h1>
                      <p className={`text-sm md:text-base italic ${theme.accentColor} font-medium`}>
                        Uma Aventura de {genreInfo.name}
                      </p>
                    </div>

                    <div className="text-center pb-4 space-y-2">
                      <div className="w-16 h-px bg-current mx-auto opacity-30" />
                      <p className="text-xs font-semibold opacity-85">
                        Escrito por
                      </p>
                      <p className={`text-sm font-bold uppercase tracking-wider ${theme.accentColor}`}>
                        {playerName}
                      </p>
                      <p className="text-[10px] opacity-50">
                        &amp; Inteligência Artificial
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. PÁGINAS DE CENA */}
                {assistantMessages.map((msg, index) => {
                  const text = msg.parts
                    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                    .map(p => p.text)
                    .join('') || ''
                  const { narrative } = parseChoices(text)

                  return (
                    <div key={msg.id || index} className="flex-[0_0_100%] min-w-0 px-2 flex justify-center">
                      <div className={`w-full aspect-[1/1.414] max-h-[75vh] flex flex-col justify-between p-6 md:p-8 ${theme.bookBg} ${theme.textColor} ${theme.borderColor} ${theme.borderStyle} ${theme.fontClass} relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
                        
                        {/* Imagem no topo */}
                        <div className="w-full flex-shrink-0">
                          <BookPageImage
                            messageId={msg.id || index.toString()}
                            alt={`Cena do Capítulo ${index + 1}`}
                            genreColor={genreInfo.color}
                          />
                        </div>

                        {/* Texto no meio/baixo com scroll caso seja muito grande */}
                        <div className="flex-1 my-4 overflow-y-auto pr-1">
                          <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                            {narrative}
                          </p>
                        </div>

                        {/* Rodapé da Página */}
                        <div className="flex justify-between items-center text-[10px] opacity-50 border-t border-current/10 pt-2 flex-shrink-0">
                          <span>Capítulo {index + 1}</span>
                          <span>Página {index + 1}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* 3. CONTRACAPA / FIM */}
                <div className="flex-[0_0_100%] min-w-0 px-2 flex justify-center">
                  <div className={`w-full aspect-[1/1.414] max-h-[75vh] flex flex-col justify-between p-8 md:p-12 ${theme.bookBg} ${theme.textColor} ${theme.borderColor} ${theme.borderStyle} ${theme.fontClass} relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
                    
                    <div className="text-center pt-8">
                      <span className="text-3xl block">📖</span>
                    </div>

                    <div className="text-center my-auto space-y-6">
                      <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest">
                        Fim da Jornada
                      </h2>
                      <div className="w-16 h-px bg-current mx-auto opacity-30" />
                      <p className="text-xs md:text-sm leading-relaxed max-w-xs mx-auto italic opacity-85">
                        &ldquo;Cada escolha abre uma porta no infinito. Esta foi a sua história. Cada caminho percorrido deixa marcas nas estrelas.&rdquo;
                      </p>
                    </div>

                    <div className="text-center pb-4 space-y-4">
                      <button
                        onClick={handlePrint}
                        className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:scale-105 hover:bg-primary/95 transition-all shadow-md cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Imprimir / Salvar PDF</span>
                      </button>
                      <p className="text-[9px] opacity-40">
                        Selecione "Salvar como PDF" no diálogo de impressão.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Botão Próximo */}
            {selectedIndex < totalPages - 1 && (
              <button
                onClick={scrollNext}
                className="absolute -right-12 lg:-right-16 z-25 p-2.5 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 text-white/80 hover:text-white transition-all cursor-pointer hidden md:block"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Paginação / Indicador do Slide */}
          <div className="mt-6 flex flex-col items-center gap-2 select-none">
            <span className="text-xs text-white/60 font-medium">
              {selectedIndex === 0 
                ? 'Capa' 
                : selectedIndex === totalPages - 1 
                  ? 'Fim' 
                  : `Página ${selectedIndex} de ${totalPages - 2}`}
            </span>
            
            {/* Dots */}
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi && emblaApi.scrollTo(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                    selectedIndex === i ? 'bg-primary w-4' : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  )
}
