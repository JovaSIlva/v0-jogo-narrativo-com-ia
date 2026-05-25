'use client'

import { motion } from 'framer-motion'

interface StoryDisplayProps {
  narrative: string
  isStreaming: boolean
}

export function StoryDisplay({ narrative, isStreaming }: StoryDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="prose prose-invert prose-lg max-w-none">
        <p className="font-serif text-lg md:text-xl leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {narrative}
          {isStreaming && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block w-2 h-5 bg-primary ml-1 align-middle"
            />
          )}
        </p>
      </div>
    </motion.div>
  )
}
