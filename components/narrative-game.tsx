'use client'

import { useState, useCallback, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Genre, getInitialPrompt, SavedGameData } from '@/lib/game-store'
import { GenreSelector } from '@/components/genre-selector'
import { PlayerSetup } from '@/components/player-setup'
import { GameInterface } from '@/components/game-interface'

type GamePhase = 'genre-select' | 'player-setup' | 'playing'

export default function NarrativeGame() {
  const [phase, setPhase] = useState<GamePhase>('genre-select')
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [savedGames, setSavedGames] = useState<SavedGameData[]>([])
  const [currentGameId, setCurrentGameId] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('savedGames')
    if (saved) {
      try {
        setSavedGames(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved games', e)
      }
    }
  }, [])

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

  useEffect(() => {
    if (phase === 'playing' && selectedGenre && playerName && messages.length > 0 && currentGameId) {
      const saved = localStorage.getItem('savedGames')
      let games: SavedGameData[] = []
      if (saved) {
        try {
          games = JSON.parse(saved)
        } catch (e) {}
      }
      
      const gameData: SavedGameData = {
        id: currentGameId,
        genre: selectedGenre,
        playerName,
        messages,
        updatedAt: Date.now()
      }

      const existingIndex = games.findIndex(g => g.id === currentGameId)
      if (existingIndex >= 0) {
        games[existingIndex] = gameData
      } else {
        games.push(gameData)
      }
      
      localStorage.setItem('savedGames', JSON.stringify(games))
      setSavedGames(games)
    }
  }, [phase, selectedGenre, playerName, messages, currentGameId])

  const handleContinue = useCallback((id: string) => {
    const game = savedGames.find(g => g.id === id)
    if (game) {
      setSelectedGenre(game.genre)
      setPlayerName(game.playerName)
      setMessages(game.messages)
      setCurrentGameId(game.id)
      setPhase('playing')
    }
  }, [savedGames, setMessages])

  const handleGenreSelect = useCallback((genre: Genre) => {
    setSelectedGenre(genre)
    setPhase('player-setup')
  }, [])

  const handleStartGame = useCallback((name: string) => {
    setPlayerName(name)
    setPhase('playing')
    setCurrentGameId(Date.now().toString())
    
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
    setCurrentGameId(null)
  }, [setMessages])

  const handleBack = useCallback(() => {
    setPhase('genre-select')
    setSelectedGenre(null)
  }, [])

  return (
    <>
      {phase === 'genre-select' && (
        <GenreSelector 
          onSelect={handleGenreSelect} 
          onContinue={handleContinue}
          savedGames={savedGames}
        />
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
