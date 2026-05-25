'use client'

import { useState, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Genre, getInitialPrompt } from '@/lib/game-store'
import { GenreSelector } from '@/components/genre-selector'
import { PlayerSetup } from '@/components/player-setup'
import { GameInterface } from '@/components/game-interface'

type GamePhase = 'genre-select' | 'player-setup' | 'playing'

export default function NarrativeGame() {
  const [phase, setPhase] = useState<GamePhase>('genre-select')
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
  const [playerName, setPlayerName] = useState('')

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/story',
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          messages,
          id,
          genre: selectedGenre,
        },
      }),
    }),
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

  const handleGenreSelect = useCallback((genre: Genre) => {
    setSelectedGenre(genre)
    setPhase('player-setup')
  }, [])

  const handleStartGame = useCallback((name: string) => {
    setPlayerName(name)
    setPhase('playing')
    
    // Send initial prompt to start the story
    const initialPrompt = getInitialPrompt(selectedGenre!, name)
    sendMessage({ text: initialPrompt })
  }, [selectedGenre, sendMessage])

  const handleChoice = useCallback((choice: string) => {
    sendMessage({ text: `Eu escolho: ${choice}` })
  }, [sendMessage])

  const handleRestart = useCallback(() => {
    setMessages([])
    setPhase('genre-select')
    setSelectedGenre(null)
    setPlayerName('')
  }, [setMessages])

  const handleBack = useCallback(() => {
    setPhase('genre-select')
    setSelectedGenre(null)
  }, [])

  return (
    <>
      {phase === 'genre-select' && (
        <GenreSelector onSelect={handleGenreSelect} />
      )}
      
      {phase === 'player-setup' && selectedGenre && (
        <PlayerSetup 
          genre={selectedGenre} 
          onStart={handleStartGame}
          onBack={handleBack}
        />
      )}
      
      {phase === 'playing' && selectedGenre && (
        <GameInterface
          genre={selectedGenre}
          playerName={playerName}
          messages={messages}
          isStreaming={isStreaming}
          onChoice={handleChoice}
          onRestart={handleRestart}
        />
      )}
    </>
  )
}
