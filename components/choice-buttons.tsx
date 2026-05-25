'use client'

import { motion } from 'framer-motion'

interface ChoiceButtonsProps {
  choices: string[]
  onSelect: (choice: string) => void
  disabled: boolean
}

export function ChoiceButtons({ choices, onSelect, disabled }: ChoiceButtonsProps) {
  if (choices.length === 0) return null

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
          disabled={disabled}
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
    </motion.div>
  )
}
