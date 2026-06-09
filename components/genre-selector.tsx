'use client'

import { motion } from 'framer-motion'
import { Genre, GENRE_INFO, SavedGameData } from '@/lib/game-store'

interface GenreSelectorProps {
  onSelect: (genre: Genre) => void
  onContinue?: (id: string) => void
  savedGames?: SavedGameData[]
}

export function GenreSelector({ onSelect, onContinue, savedGames = [] }: GenreSelectorProps) {
  const genres = Object.entries(GENRE_INFO) as [Genre, typeof GENRE_INFO[Genre]][]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 tracking-tight">
          Crônicas do Destino
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Suas escolhas moldam o destino. Cada decisão abre novos caminhos em uma história única, 
          criada especialmente para você.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-5xl"
      >
        {savedGames.length > 0 && onContinue && (
          <div className="mb-12">
            <h2 className="text-center text-xl md:text-2xl text-foreground/80 mb-6 font-medium">
              Continuar História
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x px-4 md:px-0">
              {savedGames.sort((a, b) => b.updatedAt - a.updatedAt).map(game => {
                const info = GENRE_INFO[game.genre]
                const date = new Date(game.updatedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                })
                
                return (
                  <motion.button
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onContinue(game.id)}
                    className={`
                      snap-center shrink-0 w-64 p-5 rounded-xl border border-border/50
                      bg-gradient-to-br ${info.color} backdrop-blur-sm
                      hover:border-primary/50 transition-all duration-300
                      text-left flex flex-col gap-2 relative overflow-hidden group
                    `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="flex justify-between items-start relative z-10">
                      <span className="text-3xl">{info.icon}</span>
                      <span className="text-xs font-medium px-2 py-1 bg-background/50 rounded-full text-foreground/70">
                        {info.name}
                      </span>
                    </div>
                    
                    <div className="relative z-10 mt-2">
                      <h3 className="font-serif text-lg font-semibold text-foreground truncate">
                        {game.playerName}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Último save: {date}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        <h2 className="text-center text-xl md:text-2xl text-foreground/80 mb-8 font-medium">
          Escolha seu gênero
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {genres.map(([key, info], index) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(key)}
              className={`
                relative group p-6 md:p-8 rounded-xl border border-border/50
                bg-gradient-to-br ${info.color} backdrop-blur-sm
                hover:border-primary/50 transition-all duration-300
                text-left overflow-hidden
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <span className="text-4xl mb-4 block">{info.icon}</span>
                <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                  {info.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {info.description}
                </p>
              </div>

              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="mt-12 text-muted-foreground/60 text-sm text-center"
      >
        Powered by AI • Cada história é única
      </motion.p>
    </div>
  )
}
