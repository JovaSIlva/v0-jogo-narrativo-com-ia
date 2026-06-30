'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ColaborarClient() {
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [selectedTier, setSelectedTier] = useState<number | null>(null)
  
  const pixKey = '9837c7d8-0282-42be-821f-2a87487e160d'

  const handleCopy = (amount?: string) => {
    navigator.clipboard.writeText(pixKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const handleSelectTier = (index: number) => {
    setSelectedTier(index)
    handleCopy(tiers[index].price)
  }

  const tiers = [
    {
      icon: '💛',
      title: 'Apoiador',
      price: '10',
      description: 'Selo 💛 Apoiador ao lado do seu nome de aventureiro no ranking',
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-300',
      glow: 'shadow-amber-500/10',
    },
    {
      icon: '🛟',
      title: 'Mantenedor',
      price: '25',
      description: 'Selo 🛟 Mantenedor com cor de destaque exclusiva nas tavernas e ranking',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-300',
      glow: 'shadow-cyan-500/20',
      highlighted: true,
    },
    {
      icon: '👑',
      title: 'Padrinho',
      price: '50',
      description: 'Selo 👑 Padrinho dourado lendário, a maior honra e prestígio da guilda',
      color: 'from-yellow-400/20 to-amber-600/10 border-yellow-400/40 text-yellow-300',
      glow: 'shadow-yellow-400/20',
    },
  ]

  return (
    <div className="w-full space-y-12 max-w-3xl mx-auto">
      {/* Introduction */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary via-foreground to-accent">
          Apoie o projeto
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Mantém as Crônicas do Destino no ar. <br />
          Sem anúncios, sem intermediários. Qualquer colaboração ajuda a cobrir os custos dos servidores e APIs de inteligência artificial que narram suas aventuras.
        </p>
      </div>

      {/* Tier Cards Grid (Larger and fully interactive) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier, idx) => {
          const isSelected = selectedTier === idx
          return (
            <motion.button
              key={idx}
              onClick={() => handleSelectTier(idx)}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex flex-col text-left justify-between p-8 rounded-2xl border bg-gradient-to-b transition-all duration-300 cursor-pointer ${
                isSelected
                  ? `from-primary/15 to-card border-primary shadow-[0_0_30px_rgba(var(--primary),0.2)]`
                  : tier.highlighted && selectedTier === null
                  ? `bg-card/60 ${tier.color} ${tier.glow} shadow-lg`
                  : 'bg-card/40 border-border/50 hover:border-border/90'
              }`}
            >
              {tier.highlighted && selectedTier === null && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[9px] font-black rounded-full uppercase tracking-wider shadow-md">
                  ★ Mais Escolhido
                </span>
              )}
              {isSelected && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-primary text-primary-foreground text-[9px] font-black rounded-full uppercase tracking-wider shadow-md">
                  ✓ Selecionado & Copiado
                </span>
              )}

              <div className="space-y-6 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-4xl filter drop-shadow-md">{tier.icon}</span>
                  <span className="text-3xl font-black font-serif text-foreground">R$ {tier.price}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-1.5">
                    {tier.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tier.description}</p>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-border/30 w-full">
                <div className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : tier.highlighted && selectedTier === null
                    ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                    : 'bg-muted text-foreground hover:bg-muted/80 border border-border/40'
                }`}>
                  {isSelected ? '💸 Chave Copiada!' : `💸 Colaborar R$ ${tier.price} via PIX`}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Access Disclaimer */}
      <div className="p-4 bg-muted/20 border border-border/30 rounded-xl text-center max-w-2xl mx-auto">
        <p className="text-xs text-muted-foreground">
          🎯 Todos os níveis liberam as mesmas recompensas (crônicas extras + sugestões prioritárias) — a diferença é o selo de honra. Se quiser doar outro valor, use a chave abaixo.
        </p>
      </div>

      {/* PIX Donation Details */}
      <div className="border border-border bg-card/20 rounded-2xl p-8 max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl font-bold text-foreground">💸 Colaborar via PIX</h2>
          <p className="text-xs text-muted-foreground">Copie a chave abaixo e insira o valor desejado no aplicativo do seu banco.</p>
        </div>

        {/* Copy Paste Code */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground">
            Chave PIX (E-mail / Aleatória)
          </label>

          <div className="flex gap-2">
            <div className="flex-1 relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                readOnly
                value={pixKey}
                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-xs font-mono text-foreground focus:outline-none tracking-wide"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors"
                title={showKey ? 'Ocultar chave' : 'Mostrar chave'}
              >
                {showKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <button
              onClick={() => handleCopy()}
              className={`px-5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-primary text-primary-foreground hover:bg-primary/95'
              }`}
            >
              {copied ? 'Copiado!' : '📋 Copiar'}
            </button>
          </div>
        </div>

        {/* Confirmation Info */}
        <div className="pt-5 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Depois, mande o comprovante para o e-mail <span className="text-primary font-bold">contato@cronicasdodestino.com.br</span> ou abra uma mensagem de suporte para liberar suas recompensas na taverna 💛
          </p>
        </div>
      </div>
    </div>
  )
}
