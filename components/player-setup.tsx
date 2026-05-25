'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Genre, GENRE_INFO } from '@/lib/game-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PlayerSetupProps {
  genre: Genre
  onStart: (playerName: string) => void
  onBack: () => void
}

export function PlayerSetup({ genre, onStart, onBack }: PlayerSetupProps) {
  const [playerName, setPlayerName] = useState('')
  const genreInfo = GENRE_INFO[genre]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerName.trim()) {
      onStart(playerName.trim())
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onBack}
        className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Voltar
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`
          w-full max-w-md p-8 md:p-10 rounded-2xl border border-border/50
          bg-gradient-to-br ${genreInfo.color} backdrop-blur-sm
        `}
      >
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">{genreInfo.icon}</span>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
            {genreInfo.name}
          </h2>
          <p className="text-muted-foreground text-sm">
            Prepare-se para sua jornada
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-foreground/80 mb-2">
              Como você deseja ser chamado?
            </label>
            <Input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Digite seu nome..."
              className="w-full bg-background/50 border-border/50 focus:border-primary"
              maxLength={30}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={!playerName.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 text-lg transition-all duration-300"
          >
            Iniciar Jornada
          </Button>
        </form>

        <p className="mt-6 text-center text-muted-foreground/60 text-xs">
          A IA criará uma história única baseada nas suas escolhas
        </p>
      </motion.div>
    </div>
  )
}
