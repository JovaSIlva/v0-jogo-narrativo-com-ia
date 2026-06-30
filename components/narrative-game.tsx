'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Genre, getInitialPrompt, SavedGameData, parseChoices } from '@/lib/game-store'
import { GenreSelector } from '@/components/genre-selector'
import { PlayerSetup } from '@/components/player-setup'
import { GameInterface } from '@/components/game-interface'
import { Header } from '@/components/header'

type GamePhase = 'genre-select' | 'player-setup' | 'playing'

interface UserSession {
  userId: string
  email: string
  name: string
}

interface NarrativeGameProps {
  user: UserSession | null
}

export default function NarrativeGame({ user }: NarrativeGameProps) {
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

  const genreRef = useRef(selectedGenre)
  useEffect(() => {
    genreRef.current = selectedGenre
  }, [selectedGenre])

  const transport = useMemo(() => new DefaultChatTransport({ 
    api: '/api/story',
    prepareSendMessagesRequest: ({ id, messages }) => ({
      body: {
        messages,
        id,
        genre: genreRef.current,
      },
    }),
  }), [])

  const { messages, sendMessage, status, setMessages } = useChat({
    transport
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

  // Extrai a descrição visual do protagonista da PRIMEIRA mensagem do assistente
  // e a mantém como âncora visual para todas as gerações de imagem subsequentes
  const protagonistDescription = useMemo(() => {
    const firstAssistant = messages.find(m => m.role === 'assistant')
    if (!firstAssistant) return undefined
    const text = firstAssistant.parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('') || ''
    return parseChoices(text).protagonistDescription
  }, [messages])

  // Ref para evitar salvar quando não há mudança real nas mensagens
  const lastSavedMessagesLengthRef = useRef(0)

  // Salvar no localStorage SEM chamar setSavedGames (evita loop infinito)
  useEffect(() => {
    if (phase !== 'playing' || !selectedGenre || !playerName || messages.length === 0 || !currentGameId) return
    // Só salvar quando o número de mensagens muda (não a cada re-render)
    if (messages.length === lastSavedMessagesLengthRef.current) return
    lastSavedMessagesLengthRef.current = messages.length

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
    // NÃO chamar setSavedGames aqui — evita re-render que cria loop
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

  const handleDeleteGame = useCallback((id: string) => {
    setSavedGames(prev => {
      const updated = prev.filter(g => g.id !== id)
      localStorage.setItem('savedGames', JSON.stringify(updated))
      return updated
    })
  }, [])

  const handleDeleteAllGames = useCallback(() => {
    setSavedGames([])
    localStorage.removeItem('savedGames')
  }, [])

  const handleRollback = useCallback(() => {
    setMessages(prev => {
      const updated = prev.slice(0, -2)
      // Forçar o salvamento no localStorage ao resetar a ref de controle
      lastSavedMessagesLengthRef.current = 0
      return updated
    })
  }, [setMessages])

  const handleHomeClick = useCallback(() => {
    if (phase === 'playing') {
      if (confirm('Deseja voltar ao menu principal? Seu progresso atual está salvo.')) {
        handleRestart()
      }
    } else {
      handleRestart()
    }
  }, [phase, handleRestart])

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* Dynamic Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-primary/5 filter blur-[130px] animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-accent/5 filter blur-[130px] animate-pulse duration-10000 delay-3000" />
      </div>

      {/* Top Navbar */}
      <Header 
        user={user} 
        onHomeClick={handleHomeClick}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 w-full">
        {phase === 'genre-select' && (
          <GenreSelector 
            onSelect={handleGenreSelect} 
            onContinue={handleContinue}
            savedGames={savedGames}
            onDelete={handleDeleteGame}
            onDeleteAll={handleDeleteAllGames}
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
            onRollback={handleRollback}
            protagonistDescription={protagonistDescription}
          />
        )}
      </main>
    </div>
  )
}

