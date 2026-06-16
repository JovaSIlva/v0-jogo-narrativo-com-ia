'use client'

import { Genre, GENRE_INFO, parseChoices } from '@/lib/game-store'
import { BookPageImage } from './book-page-image'
import { UIMessage } from 'ai'

interface PrintLayoutProps {
  genre: Genre
  playerName: string
  messages: UIMessage[]
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
    borderStyle: 'border-[8px] border-double',
  },
  terror: {
    bookBg: 'bg-[#18181b]', // Charcoal
    textColor: 'text-[#f4f4f5]',
    borderColor: 'border-[#7f1d1d]',
    accentColor: 'text-[#ef4444]',
    fontClass: 'font-serif',
    borderStyle: 'border-4 border-solid shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]',
  },
  "ficcao-cientifica": {
    bookBg: 'bg-[#0f172a]', // Deep blue
    textColor: 'text-[#f1f5f9]',
    borderColor: 'border-[#06b6d4]',
    accentColor: 'text-[#22d3ee]',
    fontClass: 'font-mono',
    borderStyle: 'border-2 border-solid shadow-[0_0_20px_rgba(6,182,212,0.3)]',
  },
  investigacao: {
    bookBg: 'bg-[#e5e5e5]', // Typewriter grey
    textColor: 'text-[#18181b]',
    borderColor: 'border-[#27272a]',
    accentColor: 'text-[#52525b]',
    fontClass: 'font-mono',
    borderStyle: 'border-4 border-dashed',
  },
  romance: {
    bookBg: 'bg-[#fff5f5]', // Soft pink-cream
    textColor: 'text-[#4c0519]',
    borderColor: 'border-[#f472b6]',
    accentColor: 'text-[#db2777]',
    fontClass: 'font-serif',
    borderStyle: 'border-[6px] border-double rounded-3xl',
  },
  "infantil-aventura": {
    bookBg: 'bg-[#fefce8]', // Warm pastel yellow
    textColor: 'text-[#713f12]',
    borderColor: 'border-[#eab308]',
    accentColor: 'text-[#ca8a04]',
    fontClass: 'font-sans',
    borderStyle: 'border-[8px] border-dashed rounded-[40px]',
  },
  "contos-fadas": {
    bookBg: 'bg-[#faf5ff]', // Soft purple
    textColor: 'text-[#581c87]',
    borderColor: 'border-[#c084fc]',
    accentColor: 'text-[#9333ea]',
    fontClass: 'font-serif',
    borderStyle: 'border-[8px] border-double rounded-[40px]',
  },
  "animais-falantes": {
    bookBg: 'bg-[#f0fdf4]', // Soft green
    textColor: 'text-[#14532d]',
    borderColor: 'border-[#4ade80]',
    accentColor: 'text-[#16a34a]',
    fontClass: 'font-sans',
    borderStyle: 'border-4 border-solid rounded-[40px]',
  },
}

export function PrintLayout({ genre, playerName, messages }: PrintLayoutProps) {
  const genreInfo = GENRE_INFO[genre]
  const theme = THEME_STYLES[genre] || THEME_STYLES.fantasia

  const assistantMessages = messages.filter((m) => m.role === 'assistant')

  return (
    <div className="fixed -left-[9999px] -top-[9999px] print:relative print:left-0 print:top-0 print:block">
      {/* Estilos CSS específicos para impressão que removem margens padrão e habilitam cores */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Ocultar elementos desnecessários na impressão */
          header, footer, nav, button, .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* 1. CAPA DO LIVRO */}
      <div 
        className={`w-[210mm] h-[297mm] p-[25mm] flex flex-col justify-between box-border relative ${theme.bookBg} ${theme.textColor} ${theme.borderColor} ${theme.borderStyle} ${theme.fontClass}`}
        style={{ breakAfter: 'page', pageBreakAfter: 'always', width: '210mm', height: '297mm' }}
      >
        {genre === 'fantasia' && (
          <div className="absolute inset-6 border border-[#b59e70]/40 pointer-events-none rounded" />
        )}
        
        <div className="text-center pt-12">
          <p className={`text-sm uppercase tracking-[0.2em] font-bold ${theme.accentColor} opacity-75`}>
            Coleção Crônicas do Destino
          </p>
          <div className="w-16 h-px bg-current mx-auto my-4 opacity-30" />
        </div>

        <div className="text-center my-auto space-y-6">
          <span className="text-6xl block">{genreInfo.icon}</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight uppercase">
            Crônicas do Destino
          </h1>
          <p className={`text-lg italic ${theme.accentColor} font-semibold`}>
            Uma Aventura de {genreInfo.name}
          </p>
        </div>

        <div className="text-center pb-12 space-y-3">
          <div className="w-24 h-px bg-current mx-auto opacity-30" />
          <p className="text-sm font-semibold opacity-80 uppercase tracking-widest">
            Escrito por
          </p>
          <p className={`text-xl font-bold uppercase tracking-widest ${theme.accentColor}`}>
            {playerName}
          </p>
          <p className="text-xs opacity-50 italic">
            &amp; Mestre Narrador IA
          </p>
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
          <div 
            key={msg.id || index}
            className={`w-[210mm] h-[297mm] p-[20mm] flex flex-col justify-between box-border relative ${theme.bookBg} ${theme.textColor} ${theme.borderColor} ${theme.borderStyle} ${theme.fontClass}`}
            style={{ breakAfter: 'page', pageBreakAfter: 'always', width: '210mm', height: '297mm' }}
          >
            {/* Imagem no topo */}
            <div className="w-full h-[110mm] overflow-hidden flex-shrink-0 flex items-center justify-center">
              <BookPageImage
                messageId={msg.id || index.toString()}
                alt={`Cena do Capítulo ${index + 1}`}
                genreColor={genreInfo.color}
              />
            </div>

            {/* Narrativa no meio */}
            <div className="flex-1 my-8 overflow-hidden">
              <p className="text-sm md:text-base leading-relaxed text-justify whitespace-pre-wrap font-medium">
                {narrative}
              </p>
            </div>

            {/* Rodapé da Página */}
            <div className="flex justify-between items-center text-xs opacity-60 border-t border-current/10 pt-4 flex-shrink-0">
              <span className="font-semibold uppercase tracking-wider">Capítulo {index + 1}</span>
              <span className="font-bold">Página {index + 1}</span>
            </div>
          </div>
        )
      })}

      {/* 3. CONTRACAPA */}
      <div 
        className={`w-[210mm] h-[297mm] p-[25mm] flex flex-col justify-between box-border relative ${theme.bookBg} ${theme.textColor} ${theme.borderColor} ${theme.borderStyle} ${theme.fontClass}`}
        style={{ breakAfter: 'page', pageBreakAfter: 'always', width: '210mm', height: '297mm' }}
      >
        <div className="text-center pt-12">
          <span className="text-4xl block">📖</span>
        </div>

        <div className="text-center my-auto space-y-8 max-w-md mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-[0.2em]">
            Fim da Jornada
          </h2>
          <div className="w-24 h-px bg-current mx-auto opacity-35" />
          <p className="text-sm md:text-base leading-relaxed italic opacity-85">
            &ldquo;Cada escolha abre uma porta no infinito. Esta foi a sua história. Cada caminho percorrido deixa marcas nas estrelas.&rdquo;
          </p>
        </div>

        <div className="text-center pb-12 space-y-3">
          <div className="w-16 h-px bg-current mx-auto opacity-30" />
          <p className="text-xs uppercase tracking-widest opacity-60">
            Crônicas do Destino • Livro Ilustrado Personalizado
          </p>
          <p className="text-[10px] opacity-40">
            Gerado automaticamente por Inteligência Artificial.
          </p>
        </div>
      </div>
    </div>
  )
}
