'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ChoiceButtonsProps {
  choices: string[]
  onSelect: (choice: string) => void
  disabled: boolean
}

export function ChoiceButtons({ choices, onSelect, disabled }: ChoiceButtonsProps) {
  const [customChoice, setCustomChoice] = useState('')
  const [isWriting, setIsWriting] = useState(false)

  if (choices.length === 0) return null

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customChoice.trim() && !disabled) {
      onSelect(customChoice.trim())
      setCustomChoice('')
      setIsWriting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-3 mt-8"
    >
      <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4 font-medium">
        O que você faz?
      </p>
      
      {choices.map((choice, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
          whileHover={{ scale: 1.01, x: 8 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelect(choice)}
          disabled={disabled || isWriting}
          className={`
            w-full p-4 md:p-5 text-left rounded-xl border border-border/50
            bg-card/50 hover:bg-card hover:border-primary/50
            transition-all duration-300 group
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:x-0
          `}
        >
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {index + 1}
            </span>
            <span className="text-foreground/90 group-hover:text-foreground transition-colors leading-relaxed">
              {choice}
            </span>
          </div>
        </motion.button>
      ))}

      {/* Option 4: Custom Prompt */}
      {!isWriting ? (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 + choices.length * 0.1 }}
          whileHover={{ scale: 1.01, x: 8 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setIsWriting(true)}
          disabled={disabled}
          className={`
            w-full p-4 md:p-5 text-left rounded-xl border border-dashed border-border/80
            bg-card/30 hover:bg-card hover:border-primary/50
            transition-all duration-300 group
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          `}
        >
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary/80 font-bold text-sm">
              4
            </span>
            <span className="text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed italic">
              Escrever minha própria ação...
            </span>
          </div>
        </motion.button>
      ) : (
        <motion.form
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={handleCustomSubmit}
          className={`
            w-full p-4 md:p-5 rounded-xl border border-primary/50
            bg-card flex flex-col gap-3 transition-all duration-300
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                4
              </span>
              <span className="text-sm font-semibold text-foreground/80">
                Sua Ação Personalizada
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsWriting(false)
                setCustomChoice('')
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={customChoice}
              onChange={(e) => setCustomChoice(e.target.value)}
              placeholder="Ex: Eu tento usar minha capa para me esconder..."
              autoFocus
              className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/70 transition-colors"
            />
            <button
              type="submit"
              disabled={!customChoice.trim() || disabled}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Enviar</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>
        </motion.form>
      )}
    </motion.div>
  )
}
