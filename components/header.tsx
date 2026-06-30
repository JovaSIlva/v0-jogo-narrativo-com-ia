'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { gameAudio } from '@/lib/audio-engine'
import { ttsEngine } from '@/lib/tts-engine'

interface HeaderProps {
  user: {
    userId: string
    email: string
    name: string
  } | null
  onHomeClick?: () => void
}

export function Header({ user, onHomeClick }: HeaderProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [muted, setMuted] = useState(true)
  const [narrationEnabled, setNarrationEnabled] = useState(false)

  useEffect(() => {
    // Sincronizar estado inicial
    setMuted(gameAudio.getIsMuted())
    setNarrationEnabled(ttsEngine.getIsEnabled())
  }, [])

  const toggleMute = () => {
    const nextMuted = !muted
    setMuted(nextMuted)
    gameAudio.setMute(nextMuted)
    if (!nextMuted) {
      gameAudio.playSFX('click')
    }
  }

  const toggleNarration = () => {
    const nextEnabled = !narrationEnabled
    setNarrationEnabled(nextEnabled)
    ttsEngine.setEnabled(nextEnabled)
    if (nextEnabled) {
      gameAudio.playSFX('click')
      ttsEngine.speak("Narrador ativado.")
    } else {
      ttsEngine.stop()
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        router.push('/login')
        router.refresh()
      }
    } catch (err) {
      console.error('Failed to logout', err)
    } finally {
      setLoggingOut(false)
    }
  }

  // Pegar iniciais do nome do usuário
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AV'

  return (
    <header className="relative z-40 w-full border-b border-border/50 bg-background/60 backdrop-blur-md px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        {onHomeClick ? (
          <button 
            onClick={onHomeClick}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 text-primary group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-foreground block leading-none">
                Crônicas
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
                do Destino
              </span>
            </div>
          </button>
        ) : (
          <Link 
            href="/"
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 text-primary group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-foreground block leading-none">
                Crônicas
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
                do Destino
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center gap-3">
        {/* Narration Toggle Button */}
        <button
          onClick={toggleNarration}
          className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-border/80 hover:bg-muted/30 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
          title={narrationEnabled ? 'Desativar narrador por voz' : 'Ativar narrador por voz'}
        >
          {narrationEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500 animate-pulse">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
              <path d="M19 10v1a6.93 6.93 0 0 1-.46 2.5"/>
              <path d="M5 10v1a6.93 6.93 0 0 0 .5 2.5"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </button>

        {/* Sound Toggle Button */}
        <button
          onClick={toggleMute}
          className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-border/80 hover:bg-muted/30 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
          title={muted ? 'Ativar som' : 'Desativar som'}
        >
          {muted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M9 9v6a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
              <path d="M17 16.95A10.07 10.07 0 0 0 21 12v-1.5"/>
              <path d="M3 10.5a9.91 9.91 0 0 0 .5 3"/>
              <path d="M12 12v.01"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary animate-pulse">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          )}
        </button>

        {/* Support Project Button */}
        <Link
          href="/colaborar"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all cursor-pointer no-underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          Apoiar Projeto
        </Link>


        {/* User Profile Dropdown */}
        {user && (
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full border border-border hover:border-muted-foreground/40 hover:bg-muted/30 transition-all cursor-pointer"
            >
              {/* User Avatar */}
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm">
                {userInitials}
              </div>
              <span className="text-xs font-medium text-muted-foreground pr-1 hidden sm:inline-block max-w-[100px] truncate">
                {user.name}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-muted-foreground transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <>
                  {/* Backdrop to close click outside */}
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl z-40"
                  >
                    <div className="px-2.5 py-2 border-b border-border/40 mb-1">
                      <div className="text-xs font-bold text-foreground truncate">{user.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</div>
                    </div>
                    
                    <button
                      disabled={loggingOut}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                      </svg>
                      {loggingOut ? 'Saindo...' : 'Sair da Guilda'}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  )
}
